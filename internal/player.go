package internal

type Color string

const (
	ColorRed    Color = "red"
	ColorBlue   Color = "blue"
	ColorGreen  Color = "green"
	ColorYellow Color = "yellow"
)

type Player struct {
	Name      string
	Color     Color
	Resources Resources
}

func NewPlayer(name string, color Color) *Player {
	return &Player{
		Name:      name,
		Color:     color,
		Resources: NewResources(),
	}
}
