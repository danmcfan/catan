package main

import (
	"catan/internal"
	"log"
	"net/http"
	"time"

	"golang.org/x/net/websocket"
)

var game *internal.Game

func SendBoard(ws *websocket.Conn) {
	data, err := game.Board.Marshal()
	if err != nil {
		log.Printf("Error marshalling board: %s", err)
		return
	}

	log.Printf("Sending board")
	ws.Write(data)
}

func HandleConnection(ws *websocket.Conn) {
	log.Printf("Connected: %s", ws.RemoteAddr())
	defer func() {
		log.Printf("Disconnected: %s", ws.RemoteAddr())
		ws.Close()
	}()

	SendBoard(ws)

	for {
		time.Sleep(5 * time.Second)
		game.Board.PlaceTiles()
		game.Board.PlaceBuildings()
		SendBoard(ws)
	}
}

func main() {
	game = internal.NewGame()
	game.Dice.Roll()
	game.Board.PlaceTiles()
	game.Board.PlaceBuildings()

	http.Handle("/ws", websocket.Handler(HandleConnection))

	log.Println("Server started on port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
