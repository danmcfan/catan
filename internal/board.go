package internal

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

const (
	MinQ        = -2
	MaxQ        = 2
	MinR        = -2
	MaxR        = 2
	MinS        = -2
	MaxS        = 2
	MinNumber   = 2
	MaxNumber   = 12
	MaxAttempts = 100
)

type Resource string

const (
	ResourceDesert Resource = "desert"
	ResourceLumber Resource = "lumber"
	ResourceBrick  Resource = "brick"
	ResourceWool   Resource = "wool"
	ResourceGrain  Resource = "grain"
	ResourceOre    Resource = "ore"
)

type Cube struct {
	Q int `json:"q"`
	R int `json:"r"`
	S int `json:"s"`
}

type Tile struct {
	Cube     Cube     `json:"cube"`
	Resource Resource `json:"resource"`
	Number   int      `json:"number"`
}

func NewTile(q int, r int, resource Resource, number int) *Tile {
	s := -q - r

	assert(q >= MinQ && q <= MaxQ, fmt.Sprintf("q out of range: %d", q))
	assert(r >= MinR && r <= MaxR, fmt.Sprintf("r out of range: %d", r))
	assert(s >= MinS && s <= MaxS, fmt.Sprintf("s out of range: %d", s))

	if resource == ResourceDesert {
		assert(number == 0, fmt.Sprintf("number must be 0 for desert: %d", number))
	} else {
		assert(
			number >= MinNumber && number <= MaxNumber,
			fmt.Sprintf("number out of range: %d", number),
		)
		assert(number != 7, "number cannot be 7")
	}

	return &Tile{
		Cube:     Cube{Q: q, R: r, S: s},
		Resource: resource,
		Number:   number,
	}
}

func (t *Tile) String() string {
	return fmt.Sprintf("Tile(%d, %d, %d, %s, %d)", t.Cube.Q, t.Cube.R, t.Cube.S, t.Resource, t.Number)
}

type Tiles []*Tile

func (t Tiles) Marshal() ([]byte, error) {
	return json.Marshal(t)
}

func (t Tiles) Neighbors(cube Cube) Tiles {
	neighborVectors := [6]Cube{
		{Q: 1, R: 0, S: -1},
		{Q: 1, R: -1, S: 0},
		{Q: 0, R: 1, S: -1},
		{Q: -1, R: 1, S: 0},
		{Q: -1, R: 0, S: 1},
		{Q: 0, R: -1, S: 1},
	}

	neighbors := make([]*Tile, 0)
	for _, nieghborVector := range neighborVectors {
		neighborCube := Cube{Q: cube.Q + nieghborVector.Q, R: cube.R + nieghborVector.R, S: cube.S + nieghborVector.S}
		for _, tile := range t {
			if tile.Cube.Q == neighborCube.Q && tile.Cube.R == neighborCube.R && tile.Cube.S == neighborCube.S {
				neighbors = append(neighbors, tile)
			}
		}
	}

	return neighbors
}

type Board struct {
	Tiles Tiles
}

func NewBoard() *Board {
	return &Board{
		Tiles: make(Tiles, 0),
	}
}

func (b *Board) PlaceTiles() {
	count := 0

	tiles, err := CreateTiles()
	for err != nil {
		count++

		if count > MaxAttempts {
			panic(fmt.Sprintf("failed to generate tiles after %d attempts", count))
		}

		tiles, err = CreateTiles()
	}

	b.Tiles = tiles
}

func CreateTiles() (Tiles, error) {
	tiles := make(Tiles, 0)

	resources := make([]Resource, 0)
	resources = append(resources, []Resource{ResourceLumber, ResourceLumber, ResourceLumber, ResourceLumber}...)
	resources = append(resources, []Resource{ResourceBrick, ResourceBrick, ResourceBrick}...)
	resources = append(resources, []Resource{ResourceWool, ResourceWool, ResourceWool, ResourceWool}...)
	resources = append(resources, []Resource{ResourceGrain, ResourceGrain, ResourceGrain, ResourceGrain}...)
	resources = append(resources, []Resource{ResourceOre, ResourceOre, ResourceOre}...)

	numbers := []int{0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12}

	for q := MinQ; q <= MaxQ; q++ {
		for r := MinR; r <= MaxR; r++ {
			s := -q - r
			if s >= MinS && s <= MaxS {
				neighbors := tiles.Neighbors(Cube{Q: q, R: r, S: s})
				redChitNeighbor := false
				for _, neighbor := range neighbors {
					if neighbor.Number == 6 || neighbor.Number == 8 {
						redChitNeighbor = true
						break
					}
				}

				numberIndex := rand.Intn(len(numbers))
				number := numbers[numberIndex]

				if redChitNeighbor {
					for number == 6 || number == 8 {
						hasValidNumber := false
						for _, n := range numbers {
							if n != 6 && n != 8 {
								hasValidNumber = true
								break
							}
						}

						if !hasValidNumber {
							return nil, fmt.Errorf("no valid number available in remaining numbers")
						}

						numberIndex = rand.Intn(len(numbers))
						number = numbers[numberIndex]
					}
				}

				numbers = append(numbers[:numberIndex], numbers[numberIndex+1:]...)

				var resource Resource
				if number == 0 {
					resource = ResourceDesert
				} else {
					resourceIndex := rand.Intn(len(resources))
					resource = resources[resourceIndex]
					resources = append(resources[:resourceIndex], resources[resourceIndex+1:]...)
				}

				tiles = append(tiles, NewTile(q, r, resource, number))
			}
		}
	}

	return tiles, nil
}
