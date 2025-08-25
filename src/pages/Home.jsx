import React from 'react'
import Spline from '@splinetool/react-spline'

const Home = () => {
  return (
    <div className="Home">
      <div  className='scene' style={{ width: "100%", height: "100vh" }}>
        <Spline className='sc' style={{width:"100%", height:"100%"}} scene="/Home.splinecode" />
      </div>
      <div className="fsa">
        <h2>DYANN</h2>
        <h1 className="fsa">
          LLM Based AI<br /><span>Driven Analytics</span>
        </h1>
      </div>
      <div className="homewrp"></div>
    </div>
  )
}

export default Home
