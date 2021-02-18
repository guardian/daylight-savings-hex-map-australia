import React, {useState} from 'react'


const SearchBox = ({searchTerm, setSearchTerm}) => {

    console.log("searchterm", searchTerm)

    return (
        <div class="search-box">
            <div class="input-label">Find an academy trust</div>
            <div>
                <input 
                    type="text" 
                    name="search-term" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}/>
                <div class="clear-button"></div>
            </div>
        </div>
    )

}




export default SearchBox;