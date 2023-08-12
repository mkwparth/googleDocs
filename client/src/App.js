import TextEditor from "./TextEditor";
import { v4 as uuidv4 } from 'uuid'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

function App() { 
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Navigate to={`/documents/${uuidv4()}`}/>}  />
        <Route path="/documents/:id" element = {<TextEditor/>}/>
      </Routes>
    </Router>
  );
}

export default App;
