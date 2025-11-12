package main

import (
	"catan/internal"
	"embed"
	"io/fs"
	"log"
	"net/http"
	"sync"
	"time"

	"golang.org/x/net/websocket"
)

//go:embed dist
var distFS embed.FS

var game *internal.Game

type Manager struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (m *Manager) Run() {
	for {
		select {
		case client := <-m.register:
			m.mu.Lock()
			m.clients[client] = true
			m.mu.Unlock()
			log.Printf("client registered, total clients: %d", len(m.clients))

		case client := <-m.unregister:
			m.mu.Lock()
			if _, ok := m.clients[client]; ok {
				delete(m.clients, client)
				client.Close()
			}
			m.mu.Unlock()
			log.Printf("client unregistered, total clients: %d", len(m.clients))

		case message := <-m.broadcast:
			m.mu.RLock()
			for client := range m.clients {
				if _, err := client.Write(message); err != nil {
					log.Printf("error sending message to client: %s", err)
					go func(c *websocket.Conn) {
						m.unregister <- c
					}(client)
				}
			}
			m.mu.RUnlock()
		}
	}
}

func (m *Manager) SendBoard() {
	data, err := game.Board.Marshal()
	if err != nil {
		log.Printf("error marshalling board: %s", err)
		return
	}
	m.broadcast <- data
}

var manager *Manager

func HandleConnection(ws *websocket.Conn) {
	log.Printf("Connected: %s", ws.RemoteAddr())
	manager.register <- ws

	data, err := game.Board.Marshal()
	if err != nil {
		log.Printf("error marshalling board: %s", err)
		return
	}
	ws.Write(data)

	defer func() {
		log.Printf("Disconnected: %s", ws.RemoteAddr())
		manager.unregister <- ws
	}()

	for {
		var msg []byte
		_, err := ws.Read(msg)
		if err != nil {
			break
		}
	}
}

func gameLoop() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		log.Println("updating game state...")

		game.Dice.Roll()
		game.Board.PlaceTiles()
		game.Board.PlaceBuildings()

		manager.SendBoard()
	}
}

func main() {
	game = internal.NewGame()
	game.Dice.Roll()
	game.Board.PlaceTiles()
	game.Board.PlaceBuildings()

	manager = NewManager()
	go manager.Run()

	go gameLoop()

	http.Handle("/ws", websocket.Handler(HandleConnection))

	distSubFS, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	http.Handle("/", http.FileServer(http.FS(distSubFS)))

	log.Println("Server started on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
	log.Println("Server stopped")
}
