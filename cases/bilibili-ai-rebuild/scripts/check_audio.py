from pathlib import Path
import os,subprocess,json,numpy as np
r=Path(__file__).resolve().parents[1];ff=os.environ.get('FFMPEG','ffmpeg')
def pcm(p):return np.frombuffer(subprocess.check_output([ff,'-v','error','-i',str(p),'-vn','-ac','1','-ar','48000','-f','f32le','-']),dtype='<f4')
a=pcm(r/'source/audio.wav');b=pcm(r/'output/去人物复刻版.mp4');n=min(len(a),len(b));results=[]
for sec in [1,170,344]:
 x=a[sec*48000:(sec+10)*48000].astype(float);y=b[sec*48000:(sec+10)*48000].astype(float);N=2**int(np.ceil(np.log2(len(x)+len(y))))
 corr=np.fft.irfft(np.fft.rfft(x,N)*np.conj(np.fft.rfft(y,N)),N);ix=np.r_[np.arange(24000),np.arange(N-24000,N)];idx=ix[np.argmax(corr[ix])];lag=int(idx if idx<N//2 else idx-N)
 score=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)))
 results.append({'startSeconds':sec,'seconds':10,'bestLagSamples':lag,'bestLagMs':lag/48,'zeroLagCorrelation':score})
report={'referenceSamples':len(a),'renderSamples':len(b),'sampleRate':48000,'windows':results,'audioMethod':'Original AAC copied without re-encoding; decoded waveform checked against normalized reference PCM','auditoryReview':'pending'}
(r/'qa/audio-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
