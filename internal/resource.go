package internal

type Resources map[Resource]int

func NewResources() Resources {
	return Resources{
		ResourceLumber: 0,
		ResourceBrick:  0,
		ResourceWool:   0,
		ResourceGrain:  0,
		ResourceOre:    0,
	}
}
