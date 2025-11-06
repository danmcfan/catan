package internal

import "math/rand"

type Die struct {
	Value int
}

func NewDie() *Die {
	return &Die{
		Value: 1,
	}
}

func (d *Die) Roll() {
	d.Value = rand.Intn(6) + 1
}

type Dice struct {
	First  *Die
	Second *Die
}

func NewDice() *Dice {
	return &Dice{
		First:  NewDie(),
		Second: NewDie(),
	}
}

func (d *Dice) Roll() {
	d.First.Roll()
	d.Second.Roll()
}
