from pathlib import Path
import os,subprocess,json,numpy as np
R=Path(__file__).resolve().parents[1]
ff=os.environ['FFMPEG']
def pcm(p):
 return np.frombuffer(subprocess.check_output([ff,'-v','error','-i',str(p),'-vn','-ac','1','-ar','48000','-f','f32le','-']),dtype='<f4').astype(float)
a=pcm(R/'source/audio.wav');b=pcm(R/'output/replica.mp4');n=min(len(a),len(b));a=a[:n];b=b[:n]
# Correlation across the complete decoded program, with an explicit +/- 20 ms offset search.
def score(lag):
 x=a[max(0,lag):min(n,n+lag):8];y=b[max(0,-lag):min(n,n-lag):8]
 return float(np.dot(x,y)/max(1e-12,np.sqrt(np.dot(x,x)*np.dot(y,y))))
best=max(range(-960,961,8),key=score)
report={'sampleRate':48000,'referenceSamples':len(a),'renderSamples':len(b),'zeroLagCorrelation':score(0),'bestLagSamples':best,'bestLagMs':best/48,'bestLagCorrelation':score(best),'method':'Mono decoded PCM; normalized waveform correlation; search +/-20 ms in 8 sample increments','auditoryReview':'pending'}
(R/'qa/audio-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
