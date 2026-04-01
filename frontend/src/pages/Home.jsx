import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/specialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SymptomChecker from '../components/SymptomChecker'
function Home() {
  return (
    <div>
        <Header />
        <SymptomChecker />
        <SpecialityMenu />
        <TopDoctors />
        <Banner />
    </div>
  )
}

export default Home