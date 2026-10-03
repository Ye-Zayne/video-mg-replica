#!/usr/bin/env python3
"""Fit one continuous cubic-bezier to measured scalar motion; standard library only."""
import argparse
import json
import math
from pathlib import Path


def cubic(t, a, b):
    return 3*(1-t)**2*t*a + 3*(1-t)*t*t*b + t**3


def ease(p, curve):
    if p <= 0:
        return 0.0
    if p >= 1:
        return 1.0
    lo, hi = 0.0, 1.0
    for _ in range(28):
        t = (lo+hi)/2
        if cubic(t, curve[0], curve[2]) < p:
            lo = t
        else:
            hi = t
    return cubic((lo+hi)/2, curve[1], curve[3])


def fit(data):
    samples = data['samples']
    if len(samples) < 5:
        raise ValueError('At least 5 measured samples, including actual start/end, are required')
    frames = [float(s['frame']) for s in samples]
    values = [float(s['value']) for s in samples]
    if not all(math.isfinite(v) for v in frames+values):
        raise ValueError('All frame/value measurements must be finite')
    if any(b <= a for a, b in zip(frames, frames[1:])):
        raise ValueError('Sample frames must be strictly increasing')
    if abs(values[-1]-values[0]) < 1e-8:
        raise ValueError('Equal endpoints cannot model a returning/looping motion; split at a measured extremum')
    start, end = frames[0], frames[-1]
    origin, delta = values[0], values[-1]-values[0]
    ps = [(f-start)/(end-start) for f in frames]
    ys = [(v-origin)/delta for v in values]
    def loss(curve):
        return sum((ease(p, curve)-y)**2 for p,y in zip(ps[1:-1],ys[1:-1])) / (len(ps)-2)
    # Deterministic multi-start coordinate descent. Approximation, not preset identification.
    seeds = [[0,0,1,1], [.22,1,.36,1], [.42,0,1,1], [.42,0,.58,1],
             [.2,1.6,.5,1], [.5,-.6,.8,1.4], [.1,.2,.9,.8]]
    best, best_loss = None, float('inf')
    bounds = [(0,1),(-3,4),(0,1),(-3,4)]
    for seed in seeds:
        curve, score = list(seed), loss(seed)
        for step in [.2, .08, .03, .01, .003, .001]:
            for _ in range(60):
                improved = False
                for axis in range(4):
                    for sign in (-1,1):
                        candidate = list(curve)
                        candidate[axis] = max(bounds[axis][0], min(bounds[axis][1], candidate[axis]+sign*step))
                        value = loss(candidate)
                        if value < score - 1e-14:
                            curve, score, improved = candidate, value, True
                if not improved:
                    break
        if score < best_loss:
            best, best_loss = curve, score
    predicted = [origin+delta*ease(p,best) for p in ps]
    errors = [p-v for p,v in zip(predicted,values)]
    return {'schemaVersion': 1, 'elementId': data.get('elementId'), 'property': data.get('property'),
            'units': data.get('units', 'unspecified'), 'startFrame': start, 'endFrame': end,
            'from': origin, 'to': values[-1], 'bezier': [round(x,6) for x in best],
            'rmse': math.sqrt(sum(e*e for e in errors)/len(errors)),
            'maxAbsoluteError': max(abs(e) for e in errors),
            'normalizedRMSE': math.sqrt(sum((e/delta)**2 for e in errors)/len(errors)),
            'samples': [{**sample, 'predicted': pred, 'error': err}
                        for sample,pred,err in zip(samples,predicted,errors)],
            'status': 'needs_visual_review',
            'method': 'deterministic multi-start coordinate descent; single CSS cubic-bezier',
            'limits': 'Fits the supplied interval only. Low measurement error does not validate unseen frames, endpoints, or original software parameters.'}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', required=True, type=Path)
    p.add_argument('--output', required=True, type=Path)
    args = p.parse_args()
    try:
        if args.output.exists():
            raise ValueError('Output exists; choose a new file to preserve prior evidence')
        result = fit(json.loads(args.input.read_text(encoding='utf-8')))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open('x', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, allow_nan=False)
            f.write('\n')
        print(f'{args.output}: RMSE={result["rmse"]:.5g}, max error={result["maxAbsoluteError"]:.5g}; visual review required')
    except (ValueError, OSError, KeyError, TypeError) as e:
        p.exit(2, f'error: {e}\n')


if __name__ == '__main__':
    main()
