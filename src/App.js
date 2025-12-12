import Home from "./Home";
import Login from "./Login";
import { Route, Routes } from "react-router-dom";
import MainPage from "./MainPage";
import { useState } from "react";
import Profile from "./Profile.js";
import TitleBar from "./TitleBar.js";
import Cart from "./Cart.js";
import SignUp from "./SignUp.js";
import Description from "./Description.js";
import Payment from "./Payment.js";
import OrderPlaced from "./OrderPlaced.js";
import AddProduct from "./AddProduct.js";


function App() {
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [search, setSearch] = useState("");
  const [proId, setProId] = useState(null);
  const isAdmin = userId === '1';

  return (
    <div className="App">
      <TitleBar userId={userId} setUserId={setUserId} search={search} setSearch={setSearch} />
      <Routes>
        <Route path="/" element={<Home search={search} />} />
        <Route path="/login" element={<Login userId={userId} setUserId={setUserId} />} />
        <Route path="/signup" element={<SignUp />} />
        {userId && (
          <>
            <Route 
              path="/odyssey/:user_id" 
              element={isAdmin ? <AddProduct /> : <MainPage setProId={setProId} search={search} userId={userId} />} 
            />
            <Route path="/cart" element={<Cart userId={userId}/>} />
            <Route path="/odyssey/:user_id/myprofile" element={<Profile userId={userId}/>} />
            <Route path="/:pro_id/description" element={<Description proId={proId} userId={userId}/>} />
            <Route path="/payment" element={<Payment userId={userId}/>} />
            <Route path="/odyssey/:user_id/orders" element={<OrderPlaced userId={userId}/>} />
            <Route path="/add-product" element={<AddProduct />}/>
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
