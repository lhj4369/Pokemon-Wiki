import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pokemon/:name" element={<DetailPage />} />
      </Routes>

      {/* ✅ 이거 추가! 알림 메시지 컨테이너 */}
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;