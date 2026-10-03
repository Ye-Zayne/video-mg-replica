import importlib.util
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'video-mg-replica/scripts/fit_motion.py'
spec = importlib.util.spec_from_file_location('fit_motion', SCRIPT)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class FitTests(unittest.TestCase):
    def test_known_ease_out_and_unseen_frames(self):
        ground = [.22,1,.36,1]
        samples = [{'frame': f, 'value': 120*(1-m.ease(f/30,ground))} for f in [0,4,9,15,22,30]]
        result = m.fit({'samples': samples, 'elementId': 'title', 'property': 'y', 'units': 'px'})
        self.assertLess(result['maxAbsoluteError'], .05)
        for f in [2,6,11,18,27]:
            self.assertLess(abs(m.ease(f/30,result['bezier'])-m.ease(f/30,ground)), .002)
        self.assertEqual(result['status'], 'needs_visual_review')

    def test_linear_negative_and_offset_frames(self):
        result = m.fit({'samples': [{'frame': 10+i*4, 'value': 90-i*15} for i in range(6)]})
        self.assertLess(result['rmse'], .001)
        self.assertEqual(result['startFrame'], 10)
        self.assertEqual(result['to'], 15)

    def test_nonpreset_curve_with_overshoot(self):
        ground = [.13,.72,.45,1.25]
        result = m.fit({'samples': [{'frame': f, 'value': 200*m.ease(f/40,ground)} for f in [0,3,8,14,20,27,33,40]]})
        self.assertLess(result['maxAbsoluteError'], 1.5)
        for f in [2,6,11,18,24,30,36]:
            self.assertLess(200*abs(m.ease(f/40,result['bezier'])-m.ease(f/40,ground)), 1.5)

    def test_loops_and_duplicate_time_rejected(self):
        for samples in [
            [{'frame': i, 'value': v} for i,v in enumerate([0,1,2,1,0])],
            [{'frame': f, 'value': i} for i,f in enumerate([0,1,1,3,4])],
            [{'frame': i, 'value': float('nan') if i == 2 else i} for i in range(5)],
        ]:
            with self.assertRaises(ValueError):
                m.fit({'samples': samples})


if __name__ == '__main__':
    unittest.main()
