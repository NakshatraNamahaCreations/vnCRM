import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import moment from "moment";
import Spinner from "react-bootstrap/Spinner";
import { Card } from "react-bootstrap";

function Report_DSR() {
  const apiURL = process.env.REACT_APP_API_URL;
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const [fromdate, setFromData] = useState(moment().format("YYYY-MM-DD"));
  const [todate, setToData] = useState(moment().format("YYYY-MM-DD"));
  const { date } = useParams();
  // console
  const currentdate = new Date();
  const formattedDate = moment(currentdate).format("YYYY-MM-DD");

  const comparedate = formattedDate === date;

  function name() {
    if (formattedDate === date) {
      return true;
    } else {
      return false;
    }
  }
  const yokesh = name();

  const [treatmentData, settreatmentData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dsrdata1, setdsrdata1] = useState([]);
  const [searchJobCatagory, setSearchJobCatagory] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [city, setcity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchTechName, setSearchTechName] = useState("");
  const [SearchBackoffice, setSearchBackoffice] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [searchpaymentMode, setsearchpaymentMode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [Totalcount, setTotalcount] = useState();
  const [searchCategory, setsearchCategory] = useState("");
  const [searchType, setsearchType] = useState("");
  const [category, setcategory] = useState("");

  const [searchJobComplete, setsearchJobComplete] = useState("");
  const [Loader, setLoader] = useState(false);

  const pageSize = 25; // Set your desired page size here

  const totalPages = Math.ceil(Totalcount / pageSize);

  const handleSearchClick = () => {
    setLoader(true);
    getservicedata();
    // getAlldata();
  };

  const getservicedata = async () => {
    try {
      let res = await axios.get(apiURL + "/getnewreporttezt", {
        params: {
          fromdate,
          todate,
          city: city,
          category: category,
        },
      });

      if (res.status === 200) {
        const allData = res.data?.dsrdata;
        setLoader(false);
        setTotalcount(res.data?.totalCount);
        setSearchResults(allData);
        settreatmentData(allData);
      }
    } catch (error) {
      console.log("Error in Search", error);
    }
  };

  // useEffect(() => {
  //   getAlldata();
  // }, [treatmentData]);

  // const getAlldata = async () => {
  //   try {
  //     const res = await axios.get(
  //       apiURL + `/getservicedatafromtodate/${fromdate}/${todate}`
  //     );

  //     if (res.status === 200) {
  //       console.log(
  //         "res.data.filterwithservicedata",
  //         res.data.filterwithservicedata
  //       );
  //       setdsrdata1(res.data.filterwithservicedata);
  //     }
  //   } catch (error) {
  //     // Handle error
  //   }
  // };

  const exportData = () => {
    const fileName = "dsr_data.xlsx";

    const filteredData1 = searchResults?.map((item) => ({
      servicedate: item.dividedDates[0]?.date,
      category: item?.category,
      customerName: item?.customerData?.[0]?.customerName,
      selectedSlotText: item.selectedSlotText,
      city: item?.city,
      number: item?.customerData?.[0]?.mainContact,
      service: item.service,
      address: `${item?.deliveryAddress?.platNo}, ${item?.deliveryAddress?.address} - ${item?.deliveryAddress?.landmark}`,
      desc: item?.desc,
      amount: item?.GrandTotal,
      paymentMode: SERVICEMode(item),
      Technician: item?.dsrdata?.[0]?.TechorPMorVendorName,
      BackofficeExecutive: item?.BackofficeExecutive,
      status:
        SERVICECANCLE(item) === "CANCEL"
          ? "CANCEL"
          : SERVICECOMPLETEDBYOP(item) === "YES"
          ? "Closed OM"
          : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData1);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DSR Data");
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    async function filterResults() {
      try {
        let results = treatmentData;
        if (SearchBackoffice) {
          results = results.filter(
            (item) =>
              item.BackofficeExecutive &&
              item.BackofficeExecutive.toLowerCase().includes(
                SearchBackoffice.toLowerCase()
              )
          );
        }
        if (searchCustomerName) {
          results = results.filter(
            (item) =>
              item.customerData[0]?.customerName &&
              item.customerData[0]?.customerName
                .toLowerCase()
                .includes(searchCustomerName.toLowerCase())
          );
        }
        if (city) {
          results = results.filter(
            (item) =>
              item.city && item.city.toLowerCase().includes(city.toLowerCase())
          );
        }

        if (searchAddress) {
          results = results.filter(
            (item) =>
              (item.customerData[0]?.cnap &&
                item.customerData[0]?.cnap
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase())) ||
              (item.customerData[0]?.rbhf &&
                item.customerData[0]?.rbhf
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase()))
          );
        }
        if (searchContact) {
          results = results.filter((item) => {
            const mainContact = item.customerData[0]?.mainContact;
            if (typeof mainContact === "string") {
              return mainContact
                .toLowerCase()
                .includes(searchContact.toLowerCase());
            } else if (typeof mainContact === "number") {
              const stringMainContact = String(mainContact); // Convert number to string
              return stringMainContact
                .toLowerCase()
                .includes(searchContact.toLowerCase());
            }
            return false; // Exclude if mainContact is neither string nor number
          });
        }

        if (searchTechName) {
          results = results.filter(
            (item) =>
              // item.dsrdata[0]?.TechorPMorVendorName &&
              item.dsrdata[0]?.TechorPMorVendorName === searchTechName
          );
        }
        if (searchJobComplete) {
          results = results.filter(
            (item) =>
              item.dsrdata &&
              item.dsrdata[0]?.jobComplete
                .toLowerCase()
                .includes(searchJobComplete.toLowerCase())
          );
        }
        if (searchJobType) {
          results = results.filter(
            (item) =>
              item.service &&
              item.service.toLowerCase().includes(searchJobType.toLowerCase())
          );
        }
        if (searchType) {
          results = results.filter(
            (item) =>
              item.type &&
              item.type.toLowerCase().includes(searchType.toLowerCase())
          );
        }
        if (searchDesc) {
          results = results.filter(
            (item) =>
              item.desc &&
              item.desc.toLowerCase().includes(searchDesc.toLowerCase())
          );
        }
        if (searchCategory) {
          results = results.filter(
            (item) =>
              item.category &&
              item.category.toLowerCase().includes(searchCategory.toLowerCase())
          );
        }
        if (searchpaymentMode) {
          results = results.filter(
            (item) =>
              item.paymentMode &&
              item.paymentMode
                .toLowerCase()
                .includes(searchpaymentMode.toLowerCase())
          );
        }
        setSearchResults(results);
      } catch (error) {
        console.log("Error in Search", error);
      }
    }
    filterResults();
  }, [
    SearchBackoffice,
    searchCustomerName,
    city,
    searchAddress,
    searchContact,
    searchJobType,
    searchDesc,
    searchpaymentMode,
    searchTechName,
    searchCategory,
    searchJobComplete,
    searchType,
  ]);

  const passfunction = (sId) => {
    const filt = dsrdata1.filter((i) => i.serviceInfo[0]?._id === sId?._id);
    const TTnameValue = filt[0]?.TechorPMorVendorName;

    return TTnameValue;
  };
  useEffect(() => {
    SERVICESTARTED();
  }, []);

  const SERVICESTARTED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service?._id
    );

    return filterStartTime[0]?.startJobTime;
  };

  const SERVICECOMPLETED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service?._id
    );
    return filterStartTime[0]?.endJobTime;
  };

  const SERVICECOMPLETEDBYOP = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service?._id
    );

    return filterStartTime[0]?.jobComplete;
  };

  const SERVICECANCLE = (service) => {
    // console.log("syogi=====",dsrdata1)
    const filterStartTime = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service._id
    );

    return filterStartTime[0]?.jobComplete;
  };

  const SERVICEMode = (service) => {
    const filterpaymentmde = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service._id
    );

    return filterpaymentmde[0]?.paymentType;
  };
  const returndata = (data) => {
    const dateToMatch = new Date(date);
    const matchingData = [];

    let charge = 0;
    data.dividedamtDates.forEach((dateObj, index) => {
      const dividedDate = new Date(dateObj.date);
      if (dividedDate.getDate() === dateToMatch.getDate()) {
        matchingData.push({
          date: dateObj.date,
          charge: data.dividedamtCharges[index].charge,
        });
      }
    });

    return matchingData[0]?.charge;
  };

  const [selectedStatus, setSelectedStatus] = useState("");

  // Function to handle legend item clicks and filter data
  const handleLegendItemClick = (status) => {
    setSelectedStatus(status);

    // Use the original treatmentData if searchResults is empty
    const dataToFilter =
      searchResults.length > 0 ? searchResults : treatmentData;

    // Logic to filter data based on the selected status
    const filteredData = dataToFilter.filter((item) => {
      switch (status) {
        case "COMPLETED":
          return item?.dsrdata[0]?.jobComplete === "YES"; // Filter for "Service Completed"
        case "CANCELLED":
          return item?.dsrdata[0]?.jobComplete === "CANCEL"; // Filter for "Service Cancelled"
        case "startJobTime":
          return item?.dsrdata[0]?.startJobTime; // Filter for "Service Started"
        case "SCOMpleted":
          return item?.dsrdata[0]?.endJobTime; // Filter for "Service Completed"
        case "DELAY":
          return item?.dsrdata[0]?.endJobTime; // Filter for "Service delay"
        case "ASSIGNTECH":
          return (
            item?.dsrdata[0]?.jobComplete !== "YES" &&
            item?.dsrdata[0]?.TechorPMorVendorName
          ); // Filter for "Assigned for Technician"
        case "NOTASSIGNTECH":
          return !item?.dsrdata[0]; // Filter for "Assigned for Technician"
        default:
          return true;
      }
    });

    setSearchResults(filteredData);
  };

  const SERVICEdelay = (selectedData) => {
    // Check if selectedData is defined
    if (!yokesh == true) {
      return;
    }

    const givenDate = moment(date, "YYYY-MM-DD");

    // Get the current date
    const currentDate = moment();

    const isPast = givenDate.isBefore(currentDate, "day");

    if (selectedData?.dsrdata[0]?.startJobTime) {
      return;
    } else {
      const selectedSlotText = selectedData?.selectedSlotText;

      if (!selectedSlotText) {
        // Handle the case where the time range is not available
        console.log("Time range not found for the selected service.");
        return false; // or handle it accordingly
      }

      // Get the current moment
      const currentMoment = moment();

      // Extract start and end times from the selected slot text
      const [startTime, endTime] = selectedSlotText?.split(" - ");

      // Parse the start time using moment
      const slotStartTime = moment(startTime, "hA");

      // Compare current time with the selected time slot
      const isPast = currentMoment.isAfter(slotStartTime);

      // Return true if the selected slot is past the current time, otherwise false
      return isPast;
    }
  };

  return (
    <div className="web">
      <Header />
      <div className="row mb-4">
        <div className="col-md-1"></div>
        <div className="col-md-10">
          <p style={{ fontSize: "25px" }}>
            <b>DSR Report &gt; Filter</b>
          </p>
        </div>
      </div>
      <div className=" row">
        <div className="container mt-4">
          <div className="row mb-3 col-12">
            <div className="col-md-1"></div>
            <div className="col-md-5">
              <div className="row align-items-center mb-3">
                <label className="col-md-4 col-form-label">From Date</label>
                <div className="col-md-1">:</div>
                <div className="col-md-6">
                  <input
                    className="form-control report-select"
                    type="date"
                    style={{ width: "200px" }}
                    value={fromdate}
                    onChange={(e) => setFromData(e.target.value)}
                  />
                </div>
              </div>

              <div className="row align-items-center">
                <label className="col-md-4 col-form-label">To Date</label>
                <div className="col-md-1">:</div>
                <div className="col-md-6">
                  <input
                    className="form-control report-select"
                    type="date"
                    style={{ width: "200px" }}
                    value={todate}
                    onChange={(e) => setToData(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="row align-items-center mb-3">
                <label className="col-md-4 col-form-label">City</label>
                <div className="col-md-1">:</div>
                <div className="col-md-6">
                  <select
                    style={{ width: "200px" }}
                    className="form-control vhs-input-value"
                    onChange={(e) => setcity(e.target.value)}
                  >
                    <option>--select--</option>
                    {admin?.city.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row align-items-center">
                <label className="col-md-4 col-form-label">Category</label>
                <div className="col-md-1">:</div>
                <div className="col-md-6">
                  <select
                    style={{ width: "200px" }}
                    className="form-control vhs-input-value"
                    onChange={(e) => setcategory(e.target.value)}
                  >
                    <option>--select--</option>
                    {admin?.category.map((category, index) => (
                      <option key={index} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p
          style={{
            justifyContent: "center",
            display: "flex",
            marginTop: "30px",
          }}
        >
          <button
            className="ps-3 pt-2 pb-2 pe-3"
            style={{
              border: 0,
              color: "white",
              backgroundColor: "#a9042e",
              borderRadius: "5px",
            }}
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
            <h5>Vijay Home Services | DSR Reports </h5>
          </Card>
        </div>{" "}
        <br />
        <div className="col-md-12">
          {Loader ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Spinner animation="border" role="status"></Spinner>
              Pleas wait .....
            </div>
          ) : (
            <table
              class=" table-hover table-bordered mt-1"
              style={{ width: "113%" }}
            >
              <thead className="">
                <tr className="table-secondary">
                  {/* <th className="table-head" scope="col"></th> */}
                  <th className="table-head" scope="col"></th>

                  <th
                    className="table-head"
                    style={{ width: "7%" }}
                    scope="col"
                  ></th>
                  <th
                    scope="col"
                    className="table-head"
                    style={{ width: "7%" }}
                  >
                    <input
                      className="vhs-table-input"
                      value={searchJobCatagory}
                      onChange={(e) => setSearchJobCatagory(e.target.value)}
                    />{" "}
                  </th>
                  <th
                    scope="col"
                    className="table-head"
                    style={{ width: "7%" }}
                  >
                    <select
                      className="vhs-table-input"
                      onChange={(e) => setsearchCategory(e.target.value)}
                      // style={{ width: "70%" }}
                    >
                      <option>Select</option>
                      {admin?.category.map((category, index) => (
                        <option key={index} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th scope="col" className="table-head">
                    <input
                      className="vhs-table-input"
                      value={searchCustomerName}
                      onChange={(e) => setSearchCustomerName(e.target.value)}
                    />{" "}
                  </th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={city}
                      onChange={(e) => setcity(e.target.value)}
                    >
                      <option value="">Select</option>
                      {[
                        ...new Set(treatmentData?.map((city) => city.city)),
                      ].map((uniqueCity) => (
                        <option value={uniqueCity} key={uniqueCity}>
                          {uniqueCity}
                        </option>
                      ))}
                    </select>{" "}
                  </th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={searchType}
                      onChange={(e) => setsearchType(e.target.value)}
                    >
                      <option value="">Select</option>
                      {[
                        ...new Set(treatmentData?.map((city) => city.type)),
                      ].map((uniqueCity) => (
                        <option value={uniqueCity} key={uniqueCity}>
                          {uniqueCity}
                        </option>
                      ))}
                    </select>{" "}
                  </th>
                  <th
                    scope="col"
                    style={{ width: "15%" }}
                    className="table-head"
                  >
                    <input
                      className="vhs-table-input"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                    />{" "}
                  </th>
                  <th scope="col" className="table-head">
                    <input
                      className="vhs-table-input"
                      value={searchContact}
                      onChange={(e) => setSearchContact(e.target.value)}
                    />{" "}
                  </th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={searchTechName}
                      onChange={(e) => setSearchBackoffice(e.target.value)}
                    >
                      <option value="">Select</option>
                      {[
                        ...new Set(
                          treatmentData?.map(
                            (item) => item?.BackofficeExecutive
                          )
                        ),
                      ].map((uniqueName) => (
                        <option value={uniqueName} key={uniqueName}>
                          {uniqueName}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={searchTechName}
                      onChange={(e) => setSearchTechName(e.target.value)}
                    >
                      <option value="">Select</option>
                      {[
                        ...new Set(
                          treatmentData
                            ?.sort((a, b) =>
                              a.dsrdata[0]?.TechorPMorVendorName.localeCompare(
                                b.dsrdata[0]?.TechorPMorVendorName
                              )
                            )
                            .map(
                              (item) => item?.dsrdata[0]?.TechorPMorVendorName
                            )
                        ),
                      ].map((uniqueName) => (
                        <option value={uniqueName} key={uniqueName}>
                          {uniqueName}
                        </option>
                      ))}
                    </select>
                  </th>
                  {/* <th scope="col" className="table-head">
                
                </th> */}
                  <th scope="col" className="table-head">
                    <input
                      className="vhs-table-input"
                      value={searchJobType}
                      onChange={(e) => setSearchJobType(e.target.value)}
                    />{" "}
                  </th>

                  <th scope="col" className="table-head"></th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={searchpaymentMode}
                      onChange={(e) => setsearchpaymentMode(e.target.value)}
                    >
                      <option value="">Select</option>

                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </select>{" "}
                  </th>
                  <th scope="col" className="table-head">
                    <select
                      className="vhs-table-input"
                      value={searchJobComplete}
                      onChange={(e) => setsearchJobComplete(e.target.value)}
                    >
                      <option value="">Select</option>

                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                      <option value="CANCEL">CANCEL</option>
                    </select>{" "}
                  </th>

                  <th scope="col" className="table-head">
                    <input
                      className="vhs-table-input"
                      value={searchDesc}
                      onChange={(e) => setSearchDesc(e.target.value)}
                    />{" "}
                  </th>
                </tr>
                <tr className="table-secondary">
                  <th className="table-head" scope="col">
                    Sr.No
                  </th>

                  <th className="table-head" scope="col">
                    Date
                  </th>
                  <th className="table-head" scope="col">
                    Time
                  </th>
                  <th className="table-head" scope="col">
                    Category
                  </th>
                  <th scope="col" className="table-head">
                    Customer Name
                  </th>
                  <th scope="col" className="table-head">
                    City
                  </th>
                  <th scope="col" className="table-head">
                    Reference
                  </th>
                  <th
                    scope="col"
                    style={{ width: "15%" }}
                    className="table-head"
                  >
                    Address
                  </th>
                  <th scope="col" className="table-head">
                    Contact No.
                  </th>
                  <th scope="col" className="table-head">
                    BackofficeExecutive
                  </th>
                  <th scope="col" className="table-head">
                    Technician
                  </th>

                  {/* <th scope="col" className="table-head">
                  Worker Name
                </th> */}
                  <th scope="col" className="table-head">
                    Job Type
                  </th>

                  <th scope="col" className="table-head">
                    Job Amount
                  </th>
                  <th scope="col" className="table-head">
                    Payment mode
                  </th>
                  <th scope="col" className="table-head">
                    jobComplete
                  </th>
                  <th scope="col" className="table-head">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults
                  .filter((selectedData) => {
                    const techName = passfunction(selectedData) || ""; // Default to an empty string if techName is undefined
                    return (
                      techName.includes(searchTechName) || searchTechName === ""
                    );
                  })
                  .map((selectedData, index) => (
                    // const chargeForCurrentRow = charge[index] || 0;
                    <tr
                      className="user-tbale-body"
                      key={index}
                      style={{
                        backgroundColor:
                          SERVICECOMPLETEDBYOP(selectedData) === "YES"
                            ? "#b660ff87"
                            : SERVICECOMPLETED(selectedData)
                            ? "#4caf50ba"
                            : SERVICECANCLE(selectedData) === "CANCEL"
                            ? "#f38981"
                            : SERVICEdelay(selectedData)
                            ? "#21e0f38c"
                            : SERVICESTARTED(selectedData)
                            ? "#ffeb3b70"
                            : passfunction(selectedData)
                            ? "darkgrey"
                            : "",
                      }}
                    >
                      <td>{index + 1}</td>
                      {/* <td>{selectedData.category}</td> */}
                      <td>{selectedData?.dividedDates[0]?.date} </td>

                      <td>{selectedData?.selectedSlotText}</td>
                      <td>{selectedData?.category}</td>

                      <td>{selectedData?.customerdata[0]?.customerName}</td>

                      {/* {selectedData.city ? (
                      <td>{selectedData.city}</td>
                    ) : ( */}
                      <td>{selectedData?.city}</td>
                      {/* )} */}
                      <td>{selectedData?.type}</td>

                      <td>
                        {selectedData?.deliveryAddress
                          ? `
                        ${selectedData?.deliveryAddress?.platNo},
                        ${selectedData?.deliveryAddress?.address} - 
                        ${selectedData?.deliveryAddress?.landmark}
                        `
                          : ""}
                      </td>

                      <td>{selectedData?.customerdata[0]?.mainContact}</td>
                      <td>{selectedData?.BackofficeExecutive}</td>

                      <td>
                        {/* {selectedData?.dsrdata &&
                        selectedData?.dsrdata.length > 0 && (
                          <p>
                            {selectedData?.dsrdata[0]?.TechorPMorVendorName}
                          </p>
                        )} */}

                        {passfunction(selectedData)}

                        {selectedData?.dsrdata[0]?.Tcanceldate && (
                          <>
                            <p
                              style={{
                                textDecoration: "underline",
                                marginBottom: 0,
                              }}
                            >
                              Cancel details
                            </p>
                            <p style={{ color: "red" }}>
                              {selectedData?.dsrdata[0]?.Tcanceldate}
                              <br />
                              {selectedData?.dsrdata[0]?.Tcancelreason}
                            </p>
                          </>
                        )}

                        {selectedData?.dsrdata[0]?.rescheduledate && (
                          <>
                            <p
                              style={{
                                textDecoration: "underline",
                                marginBottom: 0,
                              }}
                            >
                              Reschedule details
                            </p>
                            <p style={{ color: "orange" }}>
                              {selectedData?.dsrdata[0]?.rescheduledate}
                              <br />
                              {selectedData?.dsrdata[0]?.reschedulereason}
                              <br />
                              {selectedData?.dsrdata[0]?.rescheduletime}
                            </p>
                          </>
                        )}
                      </td>

                      {/* <td>{dsrdata[0]?.workerName}</td> */}

                      <td>{selectedData?.service}</td>

                      {selectedData?.type === "userapp" ? (
                        <td>{selectedData?.GrandTotal}</td>
                      ) : (
                        <td>
                          {selectedData?.contractType === "AMC"
                            ? returndata(selectedData)
                              ? returndata(selectedData)
                              : "0"
                            : selectedData.serviceCharge}
                        </td>
                      )}
                      {selectedData?.type === "userapp" ? (
                        <td>{selectedData.paymentMode}</td>
                      ) : (
                        <td>{SERVICEMode(selectedData)}</td>
                      )}
                      <td>{selectedData?.dsrdata[0]?.jobComplete}</td>

                      <td>{selectedData?.desc}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report_DSR;
