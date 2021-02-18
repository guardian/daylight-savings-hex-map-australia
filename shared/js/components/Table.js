import React, {useState, useRef, useLayoutEffect } from 'react'
import SearchBox from 'shared/js/components/SearchBox'


// make header sticky: https://dev.to/n8tb1t/tracking-scroll-position-with-react-hooks-3bbj
// add search box
// make search work - need some 'selected trust' state 
// table responds to 'selected trust' state
// all mobile views work 


const getScrollPos = (element) => {
    if(element.current){
        const pos = element.current.getBoundingClientRect();
        return { x: pos.left, y: pos.top }
    } else {
        return { x: 100, y: 100 }
    }
}

const useScrollPos = (el, setIsStuck) => {
    const position = useRef(getScrollPos(el))  // strange use of useRef to hold a mutable value
    let scheduledAnimationFrame = false;

    const doPosChange = () => {
        const currPos = getScrollPos(el)
        const isNearTop = currPos.y < 1; 
        setIsStuck(isNearTop);
        position.current = currPos;
        scheduledAnimationFrame = false;
    }

    useLayoutEffect(() => {
        const handleScroll = () => {
            if (scheduledAnimationFrame){ return; }
            scheduledAnimationFrame = true;
            requestAnimationFrame(doPosChange);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
}



const Table = ({data}) => { 

    const [searchTerm, setSearchTerm] = useState(null)
    const [isStuck, setIsStuck] = useState(false);
    const tableEl = useRef(null)
    useScrollPos(tableEl, setIsStuck)

    const selectedData = searchTerm ? data.filter(d => d.academyName.toLowerCase().includes(searchTerm.toLowerCase())) : data;

    return (
        <>
            <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="gv-result-list">
                <table ref={tableEl} class="ge-result-table">
                    <thead  class={`sticky-header ${isStuck ? 'sticky-header--fixed' : ''}`}>
                        <tr>
                            <><th>Academy Trust</th><th>Racist incidents</th><th>Temporary exclusions</th><th>Permanent exclusions</th></>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedData.map(d => {
                            return ( 
                            <tr class="row">
                                <th class="cell name">{d.academyName}</th>
                                <td class="cell incidents">{d.incidents}</td>
                                <td class="cell f-exclusions">{d.fixedExclusions}</td>
                                <td class="cell p-exclusions">{d.permExclusions}</td>
                            </tr> )
                        })
                        }
                    </tbody>
                </table>    
            </div>
        </>
    )
}


export default Table