import re
import math
import sys

svg_data = sys.stdin.read()

match = re.search(r'<path class="fil0 str1" d="([^"]+)"', svg_data)
if not match:
    print("ERROR: Could not find Sicily path in SVG", file=sys.stderr)
    sys.exit(1)

path_data = match.group(1)
print(f"Path data length: {len(path_data)} chars", file=sys.stderr)

def parse_svg_path(d):
    parts = re.findall(r'[MmCcLlHhVvZz]|[-+]?\d*\.?\d+', d)
    subpaths = []
    current = []
    i = 0
    x, y = 0.0, 0.0
    first_x, first_y = None, None
    
    def add_point(px, py, check_dup=True):
        if check_dup and current and abs(current[-1][0] - px) < 0.01 and abs(current[-1][1] - py) < 0.01:
            return
        current.append((px, py))
    
    def read_number():
        nonlocal i
        if i >= len(parts):
            return None
        val = parts[i]
        if isinstance(val, str) and val in 'MmCcLlHhVvZz':
            return None
        i += 1
        return float(val)
    
    while i < len(parts):
        token = parts[i]
        i += 1
        
        if token in 'Zz':
            if first_x is not None and first_y is not None:
                x, y = first_x, first_y
                if current:
                    add_point(x, y)
                # Start new subpath
                if current:
                    subpaths.append(current)
                    current = []
            continue
        
        if token in 'Mm':
            if current:
                subpaths.append(current)
                current = []
            nx = read_number()
            ny = read_number()
            if nx is not None and ny is not None:
                if token == 'M':
                    x, y = nx, ny
                else:
                    x, y = x + nx, y + ny
                first_x, first_y = x, y
                add_point(x, y)
            while i < len(parts) and (isinstance(parts[i], float) or re.match(r'^[-+]?\d', str(parts[i]))):
                nx = read_number()
                ny = read_number()
                if nx is not None and ny is not None:
                    if token == 'M':
                        x, y = nx, ny
                    else:
                        x, y = x + nx, y + ny
                    add_point(x, y)
            continue
        
        if token in 'Cc':
            pairs = 3
            for _ in range(pairs):
                cx = read_number()
                cy = read_number()
                if cx is None or cy is None:
                    break
            if cx is not None and cy is not None:
                if token == 'C':
                    x, y = cx, cy
                else:
                    x, y = x + cx, y + cy
                add_point(x, y)
            while i < len(parts):
                peek = parts[i]
                if isinstance(peek, str) and peek in 'MmCcLlHhVvZz':
                    break
                for _ in range(pairs):
                    cx = read_number()
                    cy = read_number()
                    if cx is None or cy is None:
                        break
                if cx is not None and cy is not None:
                    if token == 'C':
                        x, y = cx, cy
                    else:
                        x, y = x + cx, y + cy
                    add_point(x, y)
            continue
        
        if token in 'Ll':
            lx = read_number()
            ly = read_number()
            if lx is not None and ly is not None:
                if token == 'L':
                    x, y = lx, ly
                else:
                    x, y = x + lx, y + ly
                add_point(x, y)
            while i < len(parts):
                peek = parts[i]
                if isinstance(peek, str) and peek in 'MmCcLlHhVvZz':
                    break
                lx = read_number()
                ly = read_number()
                if lx is not None and ly is not None:
                    if token == 'L':
                        x, y = lx, ly
                    else:
                        x, y = x + lx, y + ly
                    add_point(x, y)
            continue
        
        if token in 'Hh':
            hx = read_number()
            if hx is not None:
                if token == 'H':
                    x = hx
                else:
                    x += hx
                add_point(x, y)
            while i < len(parts):
                peek = parts[i]
                if isinstance(peek, str) and peek in 'MmCcLlHhVvZz':
                    break
                hx = read_number()
                if hx is not None:
                    if token == 'H':
                        x = hx
                    else:
                        x += hx
                    add_point(x, y)
            continue
        
        if token in 'Vv':
            vy = read_number()
            if vy is not None:
                if token == 'V':
                    y = vy
                else:
                    y += vy
                add_point(x, y)
            while i < len(parts):
                peek = parts[i]
                if isinstance(peek, str) and peek in 'MmCcLlHhVvZz':
                    break
                vy = read_number()
                if vy is not None:
                    if token == 'V':
                        y = vy
                    else:
                        y += vy
                    add_point(x, y)
            continue
    
    if current:
        subpaths.append(current)
    
    return subpaths

subpaths = parse_svg_path(path_data)
print(f"Found {len(subpaths)} subpaths", file=sys.stderr)
for i, sp in enumerate(subpaths):
    print(f"  Subpath {i}: {len(sp)} points", file=sys.stderr)

# Find the main Sicily subpath (largest)
main = max(subpaths, key=len)
print(f"\nMain Sicily subpath: {len(main)} points", file=sys.stderr)

xs = [p[0] for p in main]
ys = [p[1] for p in main]
min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)
print(f"Bounding box: x=[{min_x:.1f}, {max_x:.1f}], y=[{min_y:.1f}, {max_y:.1f}]", file=sys.stderr)
print(f"Size: {max_x-min_x:.1f} x {max_y-min_y:.1f}", file=sys.stderr)

scale = min(100.0 / (max_x - min_x), 100.0 / (max_y - min_y)) * 0.95
center_x = (min_x + max_x) / 2
center_y = (min_y + max_y) / 2

scaled = [( (x - center_x) * scale + 50, (y - center_y) * scale + 50 ) for x, y in main]

def perpendicular_distance(point, line_start, line_end):
    x0, y0 = point
    x1, y1 = line_start
    x2, y2 = line_end
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)
    t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx*dx + dy*dy)
    if t < 0:
        return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)
    elif t > 1:
        return math.sqrt((x0 - x2)**2 + (y0 - y2)**2)
    else:
        proj_x = x1 + t * dx
        proj_y = y1 + t * dy
        return math.sqrt((x0 - proj_x)**2 + (y0 - proj_y)**2)

def rdp(points, epsilon):
    if len(points) <= 2:
        return points
    dmax = 0
    index = 0
    for i in range(1, len(points) - 1):
        d = perpendicular_distance(points[i], points[0], points[-1])
        if d > dmax:
            dmax = d
            index = i
    if dmax > epsilon:
        left = rdp(points[:index + 1], epsilon)
        right = rdp(points[index:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]

for eps in [0.3, 0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0]:
    simplified = rdp(scaled, eps)
    print(f"  eps={eps}: {len(simplified)} pts", file=sys.stderr)

epsilon = 1.0
simplified = rdp(scaled, epsilon)
print(f"\nUsing eps={epsilon}: {len(simplified)} pts", file=sys.stderr)

path_str = f"M{simplified[0][0]:.1f} {simplified[0][1]:.1f}"
for x, y in simplified[1:]:
    path_str += f"L{x:.1f} {y:.1f}"
path_str += "Z"

print(f"\nPath ({len(path_str)} chars):", file=sys.stderr)
print(path_str)
