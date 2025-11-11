package internal

type Game struct {
	Players []*Player
	Dice    *Dice
	Board   *Board
}

func NewGame() *Game {
	return &Game{
		Players: []*Player{
			NewPlayer("Alpha", ColorRed),
			NewPlayer("Beta", ColorBlue),
			NewPlayer("Gamma", ColorGreen),
			NewPlayer("Delta", ColorYellow),
		},
		Dice:  NewDice(),
		Board: NewBoard(),
	}
}
