#! /bin/env python3

# we can complete this from
# http://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
scales = [
    {
        "name": 'MAJOR',
        "notes": [0, 2, 4, 5, 7, 9, 11]
    },
    {
        "name": 'MINOR',
        "notes": [0, 2, 3, 5, 7, 8, 10]
    },
    {
        "name": 'PRYGIAN',
        "notes": [0, 1, 3, 5, 7, 8, 10]
    },
    {
        "name": 'MIXOLYDIAN',
        "notes": [0, 2, 4, 5, 7, 9, 10]
    },
    {
        "name": 'DORIAN',
        "notes": [0, 2, 3, 5, 7, 9, 10]
    },
    {
        "name": 'LYDIAN',
        "notes": [0, 2, 4, 6, 7, 9, 11]
    },
    {
        "name": 'LOCRIAN',
        "notes": [0, 1, 3, 4, 6, 8, 10]
    },
    {
        "name": 'MINOR_GYPSY',
        "notes": [0, 1, 4, 5, 7, 8, 10]
    },
    {
        "name": 'HUNGARIAN_MINOR',
        "notes": [0, 2, 3, 6, 7, 8, 11]
    },
    {
        "name": 'BHAIRAV',
        "notes": [0, 1, 4, 5, 7, 8, 11]
    },
    {
        "name": 'SUPER_LOCRIAN',
        "notes": [0, 1, 3, 4, 6, 8, 10]
    },
    {
        "name": 'MELODIC_MINOR',
        "notes": [0, 2, 3, 5, 7, 9, 11]
    },
    {
        "name": 'HARMONIC_MINOR',
        "notes": [0, 2, 3, 5, 7, 8, 11]
    },
]

def printScale(scale):
    print("const SCALE_" + scale["name"] + "_NOTES =")
    print("[")
    nb_notes = len(scale["notes"])
    for line in range(0, 8):
        text = "\t"
        for column in range(0, 8):
            offset = line * 3 + column
            value = (offset // nb_notes) * 12 + scale['notes'][offset % nb_notes]
            text += "%02d" % (value)
            if (column < 7 or line < 7):
                text += ", "
        print(text)
            
    print("];")
    print("")

for scale in scales:
    printScale(scale)
