package internal

import "testing"

const N = 100_000

func TestPlaceTiles(t *testing.T) {
	board := NewBoard()
	board.PlaceTiles()

	if len(board.Tiles) != 19 {
		t.Errorf("expected 19 tiles, got %d", len(board.Tiles))
	}
}

func TestPlaceTilesStress(t *testing.T) {
	board := NewBoard()
	for i := range N {
		board.PlaceTiles()

		if len(board.Tiles) != 19 {
			t.Errorf("[%d] expected 19 tiles, got %d", i, len(board.Tiles))
		}
	}
}

func BenchmarkPlaceTiles(b *testing.B) {
	board := NewBoard()
	for b.Loop() {
		board.PlaceTiles()
		if len(board.Tiles) != 19 {
			b.Errorf("expected 19 tiles, got %d", len(board.Tiles))
		}
	}
}

func TestListVertices(t *testing.T) {
	board := NewBoard()
	board.PlaceTiles()
	vertices := ListVertices(board.Tiles)
	if len(vertices) != 54 {
		t.Errorf("expected 54 vertices, got %d", len(vertices))
	}
}

func TestPlaceBuildings(t *testing.T) {
	board := NewBoard()
	board.PlaceTiles()
	board.PlaceBuildings()

	if len(board.Buildings) != 8 {
		t.Errorf("expected 8 buildings, got %d", len(board.Buildings))
	}
}
