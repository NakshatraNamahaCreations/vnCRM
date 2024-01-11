import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Card } from "react-bootstrap";
import * as XLSX from "xlsx";
import moment from "moment";

function Report_DSR() {
  const apiURL = process.env.REACT_APP_API_URL;
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const [dsrData, setDsrData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [fromdate, setFromData] = useState("");
  const [todate, setToData] = useState(moment().format("MM-DD-YYYY"));
  const [BackofficeExecutive, setBackOffice] = useState("");
  const [TechorPMorVendorName, setTechnicianName] = useState("");
  const [jobComplete, setJobComplete] = useState("");
  const [type, settype] = useState("");
  const [service, setService] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [city, setCity] = useState("");
  const [category, setJobCatagory] = useState("");
  const [searchInput, setSearchInput] = useState(""); // New state for search input
  const [showMessage, setShowMessage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [closeWindow, setCloseWindow] = useState(true);
  const [referencedata, setreferecedata] = useState([]);

  
useEffect(() => {
  
  getreferencetype();
 
}, [])

  
  const getreferencetype = async () => {
    let res = await axios.get(apiURL + "/master/getreferencetype");
    if ((res.status = 200)) {
      setreferecedata(res.data?.masterreference);
    }
  };

  const filterData = async () => {
    try {
      const res = await axios.post(`${apiURL}/dsrreportfilter`, {
       
        fromdate,
        todate,
        jobComplete,
        city,
        service,
        BackofficeExecutive,
        TechorPMorVendorName,
        category,
        type


      });

      if (res.status === 200) {
        console.log("res.data?.dsrdata",res.data?.dsrdata)
        setFilteredData(res.data?.dsrdata);

      } else {
        // Set filterdata to an empty array in case of an error
        setFilteredData([]);
      }
    } catch (error) {
      setFilteredData([]);
    }
  };

  // useEffect(() => {
  //   filterData()
  // }, []);

  const handleSearch = () => {
    // setFilteredData(dsrData);
    setSearchInput("");
    setShowMessage(true);
    filterData()
    
    


    setShowMessage(false);
  };

  const handleSearchClick = () => {
    // Call the search function here
    handleSearch();
    setButtonClicked(true);
  };

  const [DuplicateTech, setDuplicateTech] = useState(new Set());
  
  const [DuplicateUser, setDuplicateUser] = useState(new Set());
  
  const [DuplicateServuce, setDuplicateServuce] = useState(new Set());
  useEffect(() => {
    const uniqueTech = new Set(
      filteredData
        .map((item) => item.addcalldata[0]?.TechorPMorVendorName)
        .filter(Boolean)
    );

    const uniqueUser = new Set(
      filteredData.map((item) => item.BackofficeExecutive).filter(Boolean)
    );

    const uniqueservice = new Set(
      filteredData
        .map((item) => item.service)
        .filter(Boolean)
    );

   

   
    setDuplicateTech(uniqueTech);
    setDuplicateUser(uniqueUser);
    setDuplicateServuce(uniqueservice);
  }, [filteredData]);
 


  const exportData = () => {
    const fileName = "dsr_data.xlsx";
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DSR Data");
    XLSX.writeFile(workbook, fileName);
  };

  const columns = [
    {
      name: "Sl  No",
      selector: (row, index) => index + 1,
    },
    
    {
      name: "Book Date",
      selector: (row) => (row.date ? row.date : "-"),
    },
    {
      name: "Classification",
      selector: (row) => (row?.contractType ? row?.contractType : "-"),
    },
    {
      name: "Customer Name",
      selector: (row) =>
        row.customerData[0]?.customerName ? row.customerData[0]?.customerName : "-",
    },
    {
      name: "Contact",
      selector: (row) =>
        row.customerData[0]?.mainContact ? row.customerData[0]?.mainContact : "-",
    },
    {
      name: "City",
      selector: (row) => (row.city ? row.city : "-"),
    },
    {
      name: "Reference",
      selector: (row) =>
        row?.type ? row?.type : "-",
    },
    {
      name: "Job Category",
      selector: (row) => (row.service ? row.service : "-"),
    },
    {
      name: "Technician",
      selector: (row) => (row.techName ? row.techName : "-"),
    },
   
    {
      name: "Amount",
      selector: (row) => (row.GrandTotal ? row.GrandTotal : "-"),
    },
    {
      name: "Complete",
      selector: (row) => (row?.addcalldata[0]?.jobComplete ? row?.addcalldata[0]?.jobComplete : "_"),
    },
    {
      name: "BackOffice Exe",
      selector: (row) => (row.BackofficeExecutive ? row.BackofficeExecutive : "-"),
    },
  ];

  // const conditionalRowStyles = [
  //   {
  //     when: (row) => row.customer[0]?.color === "ORANGE",
  //     style: {
  //       backgroundColor: "orange",
  //     },
  //   },
  //   {
  //     when: (row) => row.customer[0]?.color === "RED",
  //     style: {
  //       backgroundColor: "red",
  //     },
  //   },
  //   {
  //     when: (row) => row.customer[0]?.color === "GREEN Company",
  //     style: {
  //       backgroundColor: "green",
  //     },
  //   },
  // ];
  return (
    <div style={{ backgroundColor: "#f9f6f6" }} className="web">
      <div>
        <Header />
      </div>
      <div className="p-5 border">
        {closeWindow && (
          <>
            <Card className="p-2">
              <div
                className="pt-2 pe-3"
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <i
                  class="fa-solid fa-circle-xmark report-font-hover"
                  title="Close"
                  style={{ color: "#bdbdbd", fontSize: "27px" }}
                  onClick={() => setCloseWindow(!closeWindow)}
                ></i>
              </div>
              <div className="p-4 row">
                <div className="col-md-1"></div>
                <div className="col-md-6">
                  <p>
                    <b>Call Report &gt; Filter</b>{" "}
                  </p>
                  <div className="row">
                    <div className="col-md-4"> From Date </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <input
                        className="report-select"
                        type="date"
                        onChange={(e) => setFromData(e.target.value)}
                      />
                    </div>
                  </div>
                  <br />

                  <div className="row">
                    <div className="col-md-4">Category</div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => setJobCatagory(e.target.value)}
                        // style={{ width: "70%" }}
                      >
                        <option>Select</option>
                        {admin?.category.map((category, index) => (
                          <option key={index} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                
                  <br />
                  <div className="row">
                    <div className="col-md-4">Technician Name </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onClick={(e) => setTechnicianName(e.target.value)}
                      >
                        <option>Select</option>
                        {[...DuplicateTech].map((techName) => (
                          <option key={techName}>{techName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-md-4">Backoffice Exe </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => setBackOffice(e.target.value)}
                      >
                        <option>Select</option>
                        {[...DuplicateUser].map((serviceExecute) => (
                          <option value={serviceExecute}>
                            {serviceExecute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-md-4">Service </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => setService(e.target.value)}
                      >
                        <option>Select</option>
                        {[...DuplicateServuce].map((service) => (
                          <option value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-md-4">Payment mode </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option>Select</option>
                        {/* {[...duplicatePaymentMode].map((contractType) => (
                          <option value={contractType}>{contractType}</option>
                        ))} */}
                      </select>
                    </div>
                  </div>
                  <br />
                </div>

                <div className="col-md-5">
                  <br />
                  <div className="row"></div>
                  <div className="row mt-3">
                    <div className="col-md-4 "> To Date </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <input
                        className="report-select"
                        type="date"
                        // style={{ width: "70%" }}
                        value={moment().format("MM-DD-YYYY")}
                        onChange={(e) => setToData(e.target.value)}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-md-4 ">Job Complete </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        // style={{ width: "70%" }}
                        onChange={(e) => setJobComplete(e.target.value)}
                      >
                        <option>All</option>
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                        <option value="CANCEL">CANCEL</option>
                       
                      </select>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-md-4">City </div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option>Select</option>
                        {admin?.city.map((item) => (
                          <option value={item.name}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <br />
                 




                  <br />
                  <div className="row">
                    <div className="col-md-4">Reference</div>
                    <div className="col-md-1 ms-4">:</div>
                    <div className="col-md-5 ms-4">
                      <select
                        className="report-select"
                        onChange={(e) => settype(e.target.value)}
                        // style={{ width: "70%" }}
                      >
                        <option>Select</option>
                        <option value="userapp">userapp</option>
                        <option value="website">website</option>
                        <option value="justdail">justdail</option>
                        {referencedata.map((i) => (
                          <option key={i.referencetype} value={i.referencetype}>
                            {i.referencetype}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <br />
                </div>
                <p style={{ justifyContent: "center", display: "flex" }}>
                  <button
                    className="ps-3 pt-2 pb-2 pe-3"
                    style={{
                      border: 0,
                      color: "white",
                      backgroundColor: "#a9042e",
                      borderRadius: "5px",
                    }}
                    // onChange={() => {
                    //   filterData();
                    //   setButtonClicked(true);
                    // }}
                    onClick={handleSearchClick}
                  >
                    Show
                  </button>
                  {"   "}
                  <button
                    className="ps-3 pt-2 pb-2 pe-3 ms-2"
                    style={{
                      border: 0,
                      color: "white",
                      backgroundColor: "#a9042e",
                      borderRadius: "5px",
                    }}
                    onClick={exportData}
                  >
                    <i
                      class="fa-solid fa-download"
                      title="Download"
                      // style={{ color: "white", fontSize: "27px" }}
                    ></i>{" "}
                    Export
                  </button>
                </p>
                <p>
                  {showMessage && buttonClicked && (
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "10px",
                        color: "#a9042e",
                      }}
                    >
                      Please enter a category to search!
                    </div>
                  )}
                </p>
              </div>
            </Card>
            <br />
          </>
        )}
        <div>
          <div
            className="p-2"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "white",
            }}
          >
            <div className="ms-3">
              <i
                class="fa-solid fa-print report-font-hover"
                title="Print"
                style={{ color: "#bdbdbd", fontSize: "27px" }}
                onClick={() => window.print()}
              ></i>
            </div>{" "}
            <div className="ms-3">
              <i
                class="fa-solid fa-house report-font-hover"
                title="Home"
                style={{ color: "#bdbdbd", fontSize: "27px" }}
                onClick={() => window.location.assign("/home")}
              ></i>
            </div>{" "}
            <div className="ms-3">
              <i
                class="fa-solid fa-rotate-right report-font-hover"
                title="Reload"
                style={{ color: "#bdbdbd", fontSize: "27px" }}
                onClick={() => window.location.reload()}
              ></i>
            </div>
          </div>
          <br />
        </div>
        <div>
          <Card
            className="ps-3 p-2"
            style={{ color: "white", backgroundColor: "#a9042e" }}
          >
            <h5>Vijay Home Services | DSR Reports {`, ${searchInput}`}</h5>
          </Card>
        </div>{" "}
        <br />
        <DataTable
          columns={columns}
          data={filteredData}
          // pagination
          fixedHeader
          selectableRowsHighlight
          subHeaderAlign="left"
          highlightOnHover
          // conditionalRowStyles={conditionalRowStyles}
        />
      </div>
    </div>
  );
}

export default Report_DSR;
