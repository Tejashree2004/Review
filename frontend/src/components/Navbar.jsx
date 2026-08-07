import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useState } from "react";


function Navbar() {

  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);



  const menuItems = [
    {
      name: "Home",
      path: "/home"
    },
    {
      name: "Search",
      path: "/search"
    },
    {
      name: "Categories",
      path: "/categories"
    },
    {
      name: "Favorites",
      path: "/favorites"
    },
    {
      name: "Reviews",
      path: "/reviews"
    },
    {
      name: "Notifications",
      path: "/notifications"
    },
    {
      name: "Profile",
      path: "/profile"
    }
  ];



  const handleClick = (path) => {

    navigate(path);

    setDrawerOpen(false);

  };



  return (

    <>

      {/* =========================
            Navbar
      ========================= */}


      <nav
        style={{
          width:"100%",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          padding:"16px 20px",
          background:"#111111",
          border:"1px solid #2d2d2d",
          borderRadius:"14px",
          marginBottom:"20px",
          boxSizing:"border-box"
        }}
      >


        {/* Menu Button */}

        <button

          onClick={() => setDrawerOpen(true)}

          style={{
            background:"transparent",
            border:"none",
            color:"#ffffff",
            fontSize:"22px",
            cursor:"pointer"
          }}

        >

          <FaBars />

        </button>



        {/* Logo */}

        <h2
          style={{
            margin:0,
            color:"#ffffff",
            fontWeight:"700",
            letterSpacing:"1px"
          }}
        >

          REVIO

        </h2>



        {/* Right Icons */}

        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"18px"
          }}
        >


          {/* Notification */}

          <div

            onClick={() => navigate("/notifications")}

            style={{
              position:"relative",
              cursor:"pointer"
            }}

          >

            <FaBell
              size={22}
              color="#ffffff"
            />


            <span

              style={{
                position:"absolute",
                top:"-6px",
                right:"-7px",
                background:"white",
                color:"#000000",
                fontSize:"10px",
                fontWeight:"600",
                borderRadius:"50%",
                width:"18px",
                height:"18px",
                display:"flex",
                justifyContent:"center",
                alignItems:"center"
              }}

            >

              1

            </span>


          </div>




          {/* Profile */}

          <FaUserCircle

            size={30}

            color="#ffffff"

            style={{
              cursor:"pointer"
            }}

            onClick={() => navigate("/profile")}

          />


        </div>


      </nav>





      {/* =========================
            Side Drawer
      ========================= */}


      <div

        style={{

          position:"fixed",

          top:0,

          left:drawerOpen ? "0" : "-300px",

          width:"270px",

          height:"100vh",

          background:"#111111",

          borderRight:"1px solid #2d2d2d",

          padding:"25px",

          transition:"0.3s ease",

          zIndex:2000,

          boxSizing:"border-box"

        }}

      >



        {/* Close */}

        <div

          style={{
            display:"flex",
            justifyContent:"flex-end"
          }}

        >

          <FaTimes

            size={22}

            color="#ffffff"

            style={{
              cursor:"pointer"
            }}

            onClick={() => setDrawerOpen(false)}

          />


        </div>





        <h2

          style={{
            color:"#ffffff",
            marginBottom:"30px"
          }}

        >

          REVIO

        </h2>




        {/* Menu List */}


        {
          menuItems.map((item)=>(

            <div

              key={item.name}

              onClick={()=>handleClick(item.path)}

              style={{

                color:"#ffffff",

                padding:"14px 12px",

                marginBottom:"8px",

                cursor:"pointer",

                borderRadius:"10px",

                transition:"0.3s"

              }}

              onMouseEnter={(e)=>
                e.target.style.background="#222222"
              }

              onMouseLeave={(e)=>
                e.target.style.background="transparent"
              }

            >

              {item.name}


            </div>


          ))
        }





        {/* Logout */}


        <div

          onClick={()=>navigate("/login")}

          style={{

            marginTop:"25px",

            padding:"14px 12px",

            color:"#ffffff",

            cursor:"pointer",

            borderTop:"1px solid #2d2d2d"

          }}

        >

          Logout


        </div>



      </div>



    </>

  );

}


export default Navbar;