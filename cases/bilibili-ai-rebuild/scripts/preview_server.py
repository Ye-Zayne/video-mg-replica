"""Local preview server with byte ranges for MP4 seeking."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]/'output'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def send_head(self):
        path=Path(self.translate_path(self.path))
        self.remaining=None
        if not path.is_file(): return super().send_head()
        f=path.open('rb'); size=path.stat().st_size
        start,end=0,size-1
        raw=self.headers.get('Range')
        if raw:
            m=re.fullmatch(r'bytes=(\d*)-(\d*)',raw)
            if not m:
                f.close();self.send_error(416);return None
            a,b=m.groups()
            if a:start=int(a);end=min(int(b),end) if b else end
            elif b:start=max(0,size-int(b))
            if start>end or start>=size:
                f.close();self.send_error(416);return None
        self.send_response(206 if raw else 200)
        self.send_header('Content-Type',self.guess_type(str(path)))
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Length',str(end-start+1))
        if raw:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers();f.seek(start);self.remaining=end-start+1
        return f
    def copyfile(self,source,outputfile):
        if self.remaining is None:return super().copyfile(source,outputfile)
        try:
            while self.remaining:
                data=source.read(min(1024*1024,self.remaining))
                if not data:break
                outputfile.write(data);self.remaining-=len(data)
        except (BrokenPipeError,ConnectionResetError):pass
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',8768),Handler).serve_forever()
