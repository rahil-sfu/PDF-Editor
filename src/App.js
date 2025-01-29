import React, { useState, useEffect, useRef } from 'react';
import './PdfViewer.css';
import './App.css';
import samplePDF from "./na.pdf";
import SinglePage from './Components/SinglePage';
import ModifyPage from './Components/ModifyPage';
import AutoTextArea from './Components/AutoTextArea';
import { useNavigate, BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/PdfViewer" element={<PdfViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

function PdfViewer() {
  const location = useLocation(); // Get the passed file from Home component
  const [pdfFile, setPdfFile] = useState(samplePDF); // Default PDF file
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const [isText, setIsText] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const tempRef = useRef(null);

  useEffect(() => {
    // If file is passed from Home component, set it as pdfFile
    if (location.state?.file) {
      setPdfFile(URL.createObjectURL(location.state.file));
    }
  }, [location.state]);

  useEffect(() => {
    if (isText) {
      setIsText(false);
    }
  }, [result]);

  const pageChange = (num) => setPageNumber(num);

  const addText = () => {
    setIsText(true);
    document.getElementById("drawArea").addEventListener("click", (e) => {
      e.preventDefault();
      setResult((result) => [
        ...result,
        { id: generateKey(e.pageX), x: e.pageX, y: e.pageY - 10, text: "", page: pageNumber, type: "text", ref: tempRef },
      ]);
    }, { once: true });
  };

  const undo = () => {
    let temp = result.pop();
    if (temp) {
      if (temp.type === "freehand") {
        setFlag("undo");
      }
      setRedoStack((stack) => [...stack, temp]);
      setResult([...result]);
    }
  };

  const redo = () => {
    let top = redoStack.pop();
    if (top) {
      if (top.type === "freehand") {
        setFlag("redo");
      }
      setResult((res) => [...res, top]);
    }
  };

  const getPaths = (el) => setResult((res) => [...res, el]);
  const getBounds = (obj) => setBounds(obj);
  const generateKey = (pre) => `${pre}_${new Date().getTime()}`;
  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex((x) => x.id === id);
    let item = { ...result[indx] };
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult([...result]);
  };

    // Function to handle new file upload
  const handleNewFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(URL.createObjectURL(file));
      }
    };

  const changeButtonType = (type) => setButtonType(type);
  const resetButtonType = () => setButtonType("");

  return (
    <div className="App">
      {
        result.map((res) => {
          if (res.type === "text") {
            let isShowing = res.page === pageNumber ? "visible" : "hidden";
            return (
              <AutoTextArea
                key={res.id}
                unique_key={res.id}
                val={res.text}
                onTextChange={onTextChange}
                style={{ visibility: isShowing, color: "red", fontWeight: 'normal', fontSize: 16, zIndex: 20, position: "absolute", left: res.x + 'px', top: res.y + 'px' }}
              />
            );
          }
          return null;
        })
      }
      <h1 style={{ color: "#3f51b5" }}> PDF EDITOR</h1>
      <hr />
      <div className="navbar">

         {/* New File Upload Button */}
        <button style={{ marginTop: "1%", marginBottom: "1%", position: "relative" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-upload"></i>
          <input 
            type="file" 
            accept="application/pdf" 
            style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} 
            onChange={handleNewFileUpload} 
          />
        </button>




        <button onClick={undo} style={{ marginTop: "1%", marginBottom: "1%" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-undo"></i>
        </button>
        <button onClick={redo} style={{ marginTop: "1%", marginBottom: "1%" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-redo"></i>
        </button>
        <button onClick={addText} style={{ marginTop: "1%", marginBottom: "1%" }}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-text"></i>
        </button>

        <button onClick = {() => changeButtonType("draw")} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-pencil"></i></button>
        <button onClick = {() => changeButtonType("download")} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-download"></i></button>

      </div>

      <SinglePage resetButtonType={resetButtonType} buttonType={buttonType} cursor={isText ? "text" : "default"} pdf={pdfFile} pageChange={pageChange} getPaths={getPaths} flag={flag} getBounds={getBounds} changeFlag={() => setFlag("")} />
      <ModifyPage resetButtonType={resetButtonType} buttonType={buttonType} pdf={pdfFile} result={result} bounds={bounds} />
      <hr />
    </div>
  );
}

function Home() {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setSelectedFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      navigate('/PdfViewer', { state: { file: selectedFile } });
    }
  }, [selectedFile, navigate]);

  return (
    <div className="App">
      <header className="App-header">
        <div
          className={`drag-drop-zone ${dragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop a file here or click the button below to upload.</p>
          <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileInput} />
          <label htmlFor="fileInput" className="upload-button">
            Select File
          </label>
          {fileName && <p className="file-name">Uploaded File: {fileName}</p>}
        </div>
      </header>
    </div>
  );
}

export default App;






// import React, {useState, useEffect, useRef} from 'react';
// import './PdfViewer.css';
// import './App.css';
// import samplePDF from "./na.pdf";
// import SinglePage from './Components/SinglePage';
// import ModifyPage from './Components/ModifyPage';
// import AutoTextArea from './Components/AutoTextArea';

// import { useNavigate, BrowserRouter, Routes, Route} from 'react-router-dom';


// function App(){
//   return(
//     <BrowserRouter>
//     <Routes>
//       <Route path = "/" element={<Home />} />
//       <Route path = "/PdfViewer" element= {<PdfViewer />} />
//     </Routes>
//     </BrowserRouter>
//   );
// }

// function PdfViewer() {
//   const [result, setResult] = useState([]);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [redoStack, setRedoStack] = useState([]);
//   const [flag, setFlag] = useState("");
//   const [bounds, setBounds] = useState({});
//   const [isText, setIsText] = useState(false);
//   const [buttonType, setButtonType] = useState("");
//   const tempRef = useRef(null);

//   useEffect(() => {
//     if(isText)
//     {
//       setIsText(false);
//     }
//   },[result])

//   //Keep track of current page number
//   const pageChange = (num) => {
//     setPageNumber(num);
//   }

//   //Function to add text in PDF
//   const addText = () => {
//     //Flag to change cursor if text
//     setIsText(true);
//     document.getElementById("drawArea").addEventListener("click", (e) => {
//       e.preventDefault();
//       setResult(result => [...result, {id:generateKey(e.pageX), x: e.pageX, y: e.pageY -10, text: "", page: pageNumber, type: "text", ref: tempRef}]);
//     }, { once: true });
//   }

//   //Undo function for both line and text
//   const undo = () => {
//     let temp = result.pop();
//     if(temp)
//     {
//       if(temp.type === "freehand")
//       {
//         //Flag for DrawArea reference
//         setFlag("undo");
//       }
//       setRedoStack(stack => [...stack,temp]);
//       setResult(result);
//     }
//   }

//   //Flag for DrawArea reference
//   const changeFlag = () => {
//     setFlag("");
//   }

//   //Redo functionality
//   const redo = () => {
//     let top = redoStack.pop();
//     if(top)
//     {
//       if(top.type === "freehand")
//       {
//         //Flag for DrawArea reference
//         setFlag("redo");
//       }
//       setResult(res => [...res,top]);
//     }
//   }

//   const getPaths = (el) => {
//     setResult(res => [...res,el]);
//   }

//   const getBounds = (obj) =>{
//     setBounds(obj);
//   }

//   const generateKey = (pre) => {
//     return `${ pre }_${ new Date().getTime() }`;
//   }

//   const onTextChange = (id, txt, ref) => {
//     let indx = result.findIndex(x => x.id === id);
//     let item = {...result[indx]};
//     item.text = txt;
//     item.ref = ref;
//     result[indx] = item;
//     setResult(result);
//   }

//   const changeButtonType = (type) => {
//     setButtonType(type);
//   }

//   const resetButtonType = () => {
//     setButtonType("");
//   }

//   return (
//     <div className="App" >
//     {
//       result.map((res) => {
//         if(res.type === "text")
//         {
//           let isShowing = "hidden";
//           if(res.page === pageNumber)
//           {
//             isShowing = "visible";
//           }
//           return(
//             <AutoTextArea key = {res.id} unique_key = {res.id} val = {res.text} onTextChange = {onTextChange} style = {{visibility: isShowing, color: "red" ,fontWeight:'normal', fontSize: 16, zIndex:20, position: "absolute", left: res.x+'px', top: res.y +'px'}}></AutoTextArea>
//             //<h1 key={index} style = {{textAlign: "justify",color: "red" ,fontWeight:'normal',width: 200, height: 80,fontSize: 33+'px', fontSize: 16, zIndex:10, position: "absolute", left: res.x+'px', top: res.y +'px'}}>{res.text}</h1>
//           )
//         }
//         else
//         {
//           return(null);
//         }
//       })
//     }
      
//       <h1 style = {{color: "#3f51b5"}}> PDF EDITOR</h1>

//       <hr/>
      
            
//       <div className="navbar">
//         <button onClick = {undo} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-undo"></i></button> 
//         <button onClick = {redo} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-redo"></i></button> 
//         <button onClick = {addText} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-text"></i></button>
//         <button onClick = {() => changeButtonType("draw")} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-pencil"></i></button>
//         <button onClick = {() => changeButtonType("download")} style = {{marginTop: "1%", marginBottom: "1%"}}><i style ={{fontSize: 25}} className="fa fa-fw fa-download"></i></button>
//       </div>

// {/* 
//       <button onClick = {undo} style = {{marginTop: "1%"}}>Undo</button>
//       <button onClick = {redo} style = {{marginTop: "1%"}}>Redo</button>
//       <br></br>
//       <button onClick={addText} style = {{marginTop: "1%"}}>Add Text</button>*/}
//       <SinglePage resetButtonType = {resetButtonType} buttonType = {buttonType} cursor = {isText ? "text": "default"} pdf = {samplePDF} pageChange = {pageChange} getPaths = {getPaths} flag = {flag} getBounds ={getBounds} changeFlag = {changeFlag}/>
//       <ModifyPage resetButtonType = {resetButtonType} buttonType = {buttonType} pdf = {samplePDF} result = {result} bounds = {bounds}/>
//       <hr></hr>
      
//     </div>
//   );
// }


// function Home() {
//   const [dragging, setDragging] = useState(false);
//   const [fileName, setFileName] = useState('');
//   const navigate = useNavigate();

//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragging(false);

//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0];
//       setFileName(file.name);
//       e.dataTransfer.clearData();
//     }
//   };

//   const handleFileInput = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFileName(file.name);
//     }
//   };

//   useEffect(() => {
//     if (fileName) {
//       navigate('/PdfViewer');
//     }
//   }, [fileName, navigate]);

//   return (
//     <div className="App">
//       <header className="App-header">
//         <div
//           className={`drag-drop-zone ${dragging ? 'dragging' : ''}`}
//           onDragEnter={handleDragEnter}
//           onDragOver={(e) => e.preventDefault()}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//         >
//           <p>Drag and drop a file here or click the button below to upload.</p>
//           <input
//             type="file"
//             id="fileInput"
//             style={{ display: 'none' }}
//             onChange={handleFileInput}
//           />
//           <label htmlFor="fileInput" className="upload-button">
//             Select File
//           </label>
//           {fileName && <p className="file-name">Uploaded File: {fileName}</p>}

//         </div>
//       </header>
//     </div>
//   );
// }


// export default App;