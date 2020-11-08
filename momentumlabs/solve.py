import math
import numpy as np

gridSize = 180

with open("data.txt") as h:
    data = [[float(x) for x in line.strip().split(',')] for line in h.readlines()]

def findCubeIntersection(angle):
    gs2 = gridSize / 2

    if angle == 45:
        return (gs2, -gs2)
    elif angle == 135:
        return (-gs2, -gs2)
    elif angle == 225:
        return (gs2, -gs2)
    elif angle == 315:
        return (gs2, gs2)

    t = math.tan(math.radians(angle))

    if t == 0:
      return (0, 0)

    if angle < 45:
        return (gs2, t * gs2)
    elif angle < 135:
        return (1 / t * gs2, -gs2)
    elif angle < 225:
        return (-gs2, t * gs2)
    else:
        return (1 / t * gs2, gs2)

X = []
Y = []

def findPosition(right, forward, angle):
    if angle == 0:
      return (90 - right, -90 + forward)
    elif angle == 90:
      return (forward - 90, -90 + right)
    elif angle == 180:
      return (-90 + right, 90 - forward)
    elif angle == 270:
      return (90 - forward, 90 - right)

    maxlen = max(forward, right)
    minlen = min(forward, right)
    maxangle = angle + (90 if forward > right else 0)
    minangle = angle + (90 if forward < right else 0)

    minvec = np.array([math.cos(math.radians(minangle)), math.sin(math.radians(minangle))]) * minlen
    maxvec = np.array([math.cos(math.radians(maxangle)), math.sin(math.radians(maxangle))]) * maxlen

    cubeint = np.array(findCubeIntersection(maxangle))

    X.append(cubeint[0])
    Y.append(cubeint[1])

    vect = cubeint - maxvec + minvec

    for dp in [(vect[0] + minvec[0], vect[1] + minvec[1]), (gridSize / 2, vect[1]), (-gridSize / 2, vect[1]), (vect[0], gridSize / 2), (vect[0], -gridSize / 2)]:
        print(dp)
        pp = np.array(dp) - minvec

        if all(abs(i) <= gridSize / 2 for i in pp + maxvec) and all(abs(i) <= gridSize / 2 for i in pp):
          return pp

    return (0, 0)

    raise Exception()

for right, forward, angle, heat in data:
    position = findPosition(right, forward, angle)

    X.append(position[0])
    Y.append(-position[1])

plt.scatter(X, Y)