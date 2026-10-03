import Foundation
import Vision
import ImageIO
let folder=URL(fileURLWithPath:CommandLine.arguments[1]);let output=URL(fileURLWithPath:CommandLine.arguments[2])
let files=try FileManager.default.contentsOfDirectory(at:folder,includingPropertiesForKeys:nil).filter{$0.pathExtension=="png"}.sorted{$0.lastPathComponent<$1.lastPathComponent}
FileManager.default.createFile(atPath:output.path,contents:nil)
let handle=try FileHandle(forWritingTo:output)
for (i,url) in files.enumerated(){autoreleasepool{
 do{
 let req=VNRecognizeTextRequest();req.recognitionLevel = .accurate;req.recognitionLanguages=["zh-Hans","en-US"];req.usesLanguageCorrection=true
 let h=VNImageRequestHandler(url:url);try h.perform([req])
 let lines=(req.results ?? []).compactMap{ o -> [String:Any]? in
 guard let t=o.topCandidates(1).first else{return nil};let b=o.boundingBox
 return ["text":t.string,"confidence":t.confidence,"x":b.minX,"y":1-b.maxY,"w":b.width,"h":b.height]
 }
 let data=try JSONSerialization.data(withJSONObject:["file":url.lastPathComponent,"lines":lines],options:[.sortedKeys]);handle.write(data);handle.write(Data([10]))
 }catch{fputs("OCR error \(url.lastPathComponent): \(error)\n",stderr)}
 };if i%50==0{print("OCR \(i)/\(files.count)")}}
try handle.close()
