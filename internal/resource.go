package internal

type Resource string

const (
	ResourceLumber Resource = "lumber"
	ResourceBrick  Resource = "brick"
	ResourceWool   Resource = "wool"
	ResourceGrain  Resource = "grain"
	ResourceOre    Resource = "ore"
)

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
