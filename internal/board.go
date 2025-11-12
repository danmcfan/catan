package internal

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"slices"
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

func NewCube(q int, r int) Cube {
	s := -q - r

	assert(q >= MinQ && q <= MaxQ, fmt.Sprintf("q out of range: %d", q))
	assert(r >= MinR && r <= MaxR, fmt.Sprintf("r out of range: %d", r))
	assert(s >= MinS && s <= MaxS, fmt.Sprintf("s out of range: %d", s))

	return Cube{Q: q, R: r, S: s}
}

type Vertex struct {
	Cube  Cube `json:"cube"`
	Index int  `json:"index"`
}

func NewVertex(c Cube, i int) Vertex {
	assert(i >= 0 && i <= 5, fmt.Sprintf("index out of range: %d", i))

	v := Vertex{
		Cube:  c,
		Index: i,
	}
	v.Normalize()

	return v
}

func (v Vertex) OverlappingVertices() []Vertex {
	vertexNeighbors := [6][2]struct{ dq, dr, i int }{
		{{dq: 0, dr: -1, i: 2}, {dq: 1, dr: -1, i: 4}},
		{{dq: 1, dr: -1, i: 3}, {dq: 1, dr: 0, i: 5}},
		{{dq: 1, dr: 0, i: 4}, {dq: 0, dr: 1, i: 0}},
		{{dq: 0, dr: 1, i: 5}, {dq: -1, dr: 1, i: 1}},
		{{dq: -1, dr: 1, i: 0}, {dq: -1, dr: 0, i: 2}},
		{{dq: -1, dr: 0, i: 1}, {dq: 0, dr: -1, i: 3}},
	}

	overlappingVertices := make([]Vertex, 0)
	for _, neighbor := range vertexNeighbors[v.Index] {
		nq := v.Cube.Q + neighbor.dq
		nr := v.Cube.R + neighbor.dr
		ns := -nq - nr
		ni := neighbor.i

		if nq < MinQ || nq > MaxQ || nr < MinR || nr > MaxR || ns < MinS || ns > MaxS {
			continue
		}

		overlappingVertices = append(overlappingVertices, Vertex{Cube: NewCube(nq, nr), Index: ni})
	}

	return overlappingVertices
}

func (v Vertex) NeighboringVertices() []Vertex {
	vertexNeighbors := [6][3]struct{ dq, dr, i int }{
		{{dq: 1, dr: -2, i: 3}, {dq: 0, dr: 0, i: 1}, {dq: -1, dr: 0, i: 1}},
		{{dq: 1, dr: 0, i: 0}, {dq: 0, dr: 0, i: 2}, {dq: 0, dr: 0, i: 0}},
		{{dq: 0, dr: 0, i: 1}, {dq: 0, dr: 0, i: 3}, {dq: 1, dr: 0, i: 3}},
		{{dq: 0, dr: 0, i: 2}, {dq: -1, dr: 1, i: 2}, {dq: -1, dr: 0, i: 2}},
		{{dq: 0, dr: 0, i: 5}, {dq: 0, dr: 0, i: 3}, {dq: -1, dr: 0, i: 3}},
		{{dq: 0, dr: 0, i: 0}, {dq: 0, dr: 0, i: 4}, {dq: -1, dr: 0, i: 0}},
	}

	neighboringVertices := make([]Vertex, 0)
	for _, neighbor := range vertexNeighbors[v.Index] {
		nq := v.Cube.Q + neighbor.dq
		nr := v.Cube.R + neighbor.dr
		ns := -nq - nr
		ni := neighbor.i

		if nq < MinQ || nq > MaxQ || nr < MinR || nr > MaxR || ns < MinS || ns > MaxS {
			continue
		}

		nv := NewVertex(NewCube(nq, nr), ni)
		neighboringVertices = append(neighboringVertices, nv)
	}

	return neighboringVertices
}

func (v *Vertex) Normalize() {
	for _, overlappingVertex := range v.OverlappingVertices() {
		if overlappingVertex.Cube.Q < v.Cube.Q || (overlappingVertex.Cube.Q == v.Cube.Q && overlappingVertex.Cube.R < v.Cube.R) {
			v.Cube = overlappingVertex.Cube
			v.Index = overlappingVertex.Index
		}
	}
}

func (v *Vertex) NeighboringCubes() []Cube {
	neighboringCubes := make([]Cube, 0)

	neighboringCubes = append(neighboringCubes, v.Cube)
	for _, overlappingVertex := range v.OverlappingVertices() {
		neighboringCubes = append(neighboringCubes, overlappingVertex.Cube)
	}

	return neighboringCubes
}

func (v *Vertex) PositionValue(ts Tiles) int {
	positionValue := 0
	neighboringCubes := v.NeighboringCubes()
	for _, t := range ts {
		for _, neighboringCube := range neighboringCubes {
			if neighboringCube.Q == t.Cube.Q && neighboringCube.R == t.Cube.R && neighboringCube.S == t.Cube.S {
				positionValue += t.Value()
				break
			}
		}
	}

	return positionValue
}

type Tile struct {
	Cube     Cube     `json:"cube"`
	Resource Resource `json:"resource"`
	Number   int      `json:"number"`
}

func NewTile(c Cube, r Resource, n int) Tile {
	if r == ResourceDesert {
		assert(n == 0, fmt.Sprintf("number must be 0 for desert: %d", n))
	} else {
		assert(n >= MinNumber && n <= MaxNumber, fmt.Sprintf("number out of range: %d", n))
		assert(n != 7, "number cannot be 7")
	}

	return Tile{
		Cube:     c,
		Resource: r,
		Number:   n,
	}
}

func (t Tile) Value() int {
	switch t.Number {
	case 2, 12:
		return 1
	case 3, 11:
		return 2
	case 4, 10:
		return 3
	case 5, 9:
		return 4
	case 6, 8:
		return 5
	default:
		return 0
	}
}

func (t Tile) String() string {
	return fmt.Sprintf("Tile(%d, %d, %d, %s, %d)", t.Cube.Q, t.Cube.R, t.Cube.S, t.Resource, t.Number)
}

type Tiles []Tile

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

	neighbors := make([]Tile, 0)
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

type BuildingType string

const (
	BuildingSettlement BuildingType = "settlement"
	BuildingCity       BuildingType = "city"
)

type Building struct {
	Vertex Vertex       `json:"vertex"`
	Type   BuildingType `json:"type"`
	Color  Color        `json:"color"`
}

func NewBuilding(v Vertex, t BuildingType, c Color) Building {
	return Building{
		Vertex: v,
		Type:   t,
		Color:  c,
	}
}

type Buildings []Building

func (bs Buildings) Marshal() ([]byte, error) {
	return json.Marshal(bs)
}

type Board struct {
	Tiles     Tiles     `json:"tiles"`
	Buildings Buildings `json:"buildings"`
}

func NewBoard() *Board {
	return &Board{
		Tiles: make(Tiles, 0),
	}
}

func (b Board) Marshal() ([]byte, error) {
	return json.Marshal(b)
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

				cube := NewCube(q, r)
				tiles = append(tiles, NewTile(cube, resource, number))
			}
		}
	}

	return tiles, nil
}

func (b *Board) PlaceBuildings() {
	vertexPositionValues := make(map[Vertex]int)
	for _, tile := range b.Tiles {
		for i := range 6 {
			vertex := NewVertex(tile.Cube, i)
			if _, ok := vertexPositionValues[vertex]; !ok {
				for _, cube := range vertex.NeighboringCubes() {
					for _, t := range b.Tiles {
						if t.Cube.Q == cube.Q && t.Cube.R == cube.R && t.Cube.S == cube.S {
							vertexPositionValues[vertex] += t.Value()
							break
						}
					}
				}
			}
		}
	}

	buildings := make(Buildings, 0)

	for _, color := range []Color{ColorRed, ColorBlue, ColorGreen, ColorYellow, ColorYellow, ColorGreen, ColorBlue, ColorRed} {
		maxVertex := MaxVertex(vertexPositionValues, buildings)
		buildings = append(buildings, NewBuilding(maxVertex, BuildingSettlement, color))
	}

	b.Buildings = buildings
}

func ListVertices(ts Tiles) []Vertex {
	vertexSet := make(map[Vertex]bool)
	for _, tile := range ts {
		for i := range 6 {
			vertex := NewVertex(tile.Cube, i)
			vertexSet[vertex] = true
		}
	}

	vertices := make([]Vertex, 0)
	for vertex := range vertexSet {
		vertices = append(vertices, vertex)
	}

	return vertices
}

func MaxVertex(vpv map[Vertex]int, bs Buildings) Vertex {
	vs := make([]Vertex, 0)
	for _, b := range bs {
		vs = append(vs, b.Vertex)
	}

	var maxVertex Vertex
	var maxPositionValue int

	for vertex, positionValue := range vpv {
		if CheckMaxVertex(vertex, positionValue, maxPositionValue, vs) {
			maxPositionValue = positionValue
			maxVertex = vertex
		}
	}

	return maxVertex
}

func CheckMaxVertex(v Vertex, pv int, mpv int, vs []Vertex) bool {
	if slices.Contains(vs, v) {
		return false
	}

	for _, neighboringVertex := range v.NeighboringVertices() {
		if slices.Contains(vs, neighboringVertex) {
			return false
		}
	}

	if pv > mpv {
		return true
	}

	return false
}
