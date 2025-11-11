package main

import (
	"catan/internal"
	"log"
	"net/http"
	"time"

	"golang.org/x/net/websocket"
)

var game *internal.Game

func SendTiles(ws *websocket.Conn) {
	data, err := game.Board.Tiles.Marshal()
	if err != nil {
		log.Printf("Error marshalling tiles: %s", err)
		return
	}

	log.Printf("Sending tiles")
	ws.Write(data)
}

func HandleConnection(ws *websocket.Conn) {
	log.Printf("Connected: %s", ws.RemoteAddr())
	defer func() {
		log.Printf("Disconnected: %s", ws.RemoteAddr())
		ws.Close()
	}()

	for {
		game.Board.PlaceTiles()
		SendTiles(ws)
		time.Sleep(1 * time.Second)
	}
}

func main() {
	game = internal.NewGame()
	game.Dice.Roll()
	game.Board.PlaceTiles()

	http.Handle("/ws", websocket.Handler(HandleConnection))

	log.Println("Server started on port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
