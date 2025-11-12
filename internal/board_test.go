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
