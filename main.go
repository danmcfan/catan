package main

import (
	"catan/internal"
	"log"
)

func main() {
	game := internal.NewGame()
	game.Dice.Roll()
	for range 10 {
		game.Dice.Roll()
		log.Println("Dice result:", game.DiceResult())
	}
}
