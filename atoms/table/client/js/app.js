import React, { render, useState } from "react"
import Table from 'shared/js/components/Table'
import * as axios from 'axios'

const wrapper = document.querySelector('#interactive-wrapper')
const acdemyDataFileName = "<%= path %>/academies.json"

const getData = (fileName) => {
    return axios.get(fileName).then((res) => res);
}


const run = async () => {

    const academyData = await getData(acdemyDataFileName);



    render(
            <Table data={academyData.data}/>,
            wrapper)

}

run();


