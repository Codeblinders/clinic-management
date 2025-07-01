import { FaInfoCircle } from 'react-icons/fa';
import { MdError } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";

import { getCurrentDate, formatCurrency } from '../utils/General';
import { SweetAlert } from '../utils/Alert'
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from '../hooks/index';
import { AgGridReact } from 'ag-grid-react'; //* React Grid Logic
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../Configs/firebase';
import { useTheme } from '../hooks/index'
import { Link } from 'react-router-dom';

const MedicalCertificate = () => {
    const themeValue = useTheme();
    const bonusMedicineRef = useRef()
    const [queryByIllnessName, setQueryByIllnessName] = useState('');
    const [symptom, setSymptom] = useState('');

    const [bonusMedicineList, setBonusMedicineList] = useState([]) //* Render full list of Medicine from Firebase in Bonus Medicine Form
    const [medicines, setMedicines] = useState([]); //* Contain each medicine object after query them from reference in Symptoms Collection

    const [queryUserInfo, setQueryUserInfo] = useState('');
    const [userData, setUserData] = useState('');

    //* This state store error message and display when User or Prescription Info not found
    const [errorMessage, setErrorMessage] = useState({})

    //* If there is no document at the location referenced by docRef,
    //* the resulting document will be empty and calling exists on it
    //* will return false.
    const getMedicineFromReference = async (reference) => {
        const docRef = doc(db, reference.path);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // docSnap.data() will be undefined in this case
            console.log('No such document!');
            return;
        }

        const medicine = docSnap.data();

        // Result: an Array of Object
        setMedicines((prevData) => [...prevData, medicine]);
    };

    //* Fetch prescription detail information from FireStore
    const receivePrescriptionData = async () => {
        if(!queryByIllnessName) {
            setSymptom('');
            setErrorMessage(prevData => ({...prevData, queryPrescription: ''}))
            return ;   
        }
        try {
            const symptomsRef = collection(db, 'Symptoms');
            // Create a query against the collection.
            // Transform both name in FireStore and User typed to lowercase so that they don't
            // have to type exactly the name with some Uppercase character
            const q = query(symptomsRef, where('name', '==', queryByIllnessName.toLowerCase()));
            // After creating a query object, use the get() function to retrieve the results
            const querySnapshot = await getDocs(q);

            //* Not Found Case
            if (querySnapshot.size === 0) {
                setSymptom('');
                setErrorMessage(prevData => ({
                    ...prevData,
                    queryPrescription: 'No prescription data found for this symptom'
                }));
                return;
            }
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setSymptom(doc.data());
            });

            SweetAlert.Toast.Success({title: 'Successfully retrieved prescription information'})
            setErrorMessage(prevData => ({...prevData, queryPrescription: ''}))
        } catch (error) {
            SweetAlert.Message.Error({title: 'Error occurred', text: 'Unable to find corresponding prescription information'})
            setErrorMessage(prevData => ({
                ...prevData,
                queryPrescription: error.message
            }));
        }
    };

    //* Fetch user detail information from FireStore
    const receiveUserData = async () => {
        if(!queryUserInfo) {
            setUserData('');
            setErrorMessage(prevData => ({...prevData, queryUser: ''}))
            return ;
        }
        try {
            //* Convert the query user type to Number Data Type
            //* Ex: '0907722143' --> 907722143
            const queryPhoneNumber = Number(queryUserInfo);

            const patientsRef = collection(db, 'Patients');
            // Create a query against the collection.
            const q = query(patientsRef, where('phoneNumber', '==', queryPhoneNumber));

            // After creating a query object, use the get() function to retrieve the results
            const querySnapshot = await getDocs(q);

            //* Not Found Case
            if (querySnapshot.size === 0) {
                setUserData('');
                setErrorMessage(prevData => ({...prevData, queryUser: 'Patient information not found'}))
                return;
            }

            querySnapshot.forEach((doc) => {
                //* doc.data() is never undefined for query doc snapshots
                setUserData(doc.data());
            });
            SweetAlert.Toast.Success({title: 'Successfully retrieved patient information'})
            setErrorMessage(prevData => ({...prevData, queryUser: ''}))
        } catch (error) {
            setErrorMessage(prevData => ({...prevData, queryUser: error.message}))
        }
    };

    const getMedicineList = async () => {
        const querySnapshot = await getDocs(collection(db, 'Medicines'));
        querySnapshot.forEach((doc) => {
            const medicine = doc.data();
            medicine.cost = formatCurrency(Number(medicine.cost)); // Format the currency property in VND format
            medicine.ref = doc.ref; //* Attach the ref property to object pass it as reference datatype to FireStore
            setBonusMedicineList((prevData) => [...prevData, medicine]);
        });
    };

    const checkboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    const headerCheckboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    //* Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
        {
            headerName: 'Medicine Name',
            field: 'name',
            wrapText: true,
            autoHeight: true,
            filter: true,
        },
        { headerName: 'Symptom', field: 'symptom', wrapText: true, filter: true },
        {
            headerName: 'Price', 
            valueGetter: params => {
                if(typeof params.data.cost === 'string') return params.data.cost
                return formatCurrency(params.data.cost);
            },
            filter: true
        },
        { headerName: 'Dosage', field: 'usage', wrapText: true, filter: true },
        { headerName: 'Ingredients', field: 'ingredient', wrapText: true, filter: true },
    ]);

    //* Column Definitions: Defines & controls grid columns.
    const [colDefsBonusMedicineList, setColDefsbonusMedicineList] = useState([
        {
            headerName: 'Medicine Name',
            width: 350,
            field: 'name',
            autoHeight: true,
            pinned: 'left',
            filter: true,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        { headerName: 'Symptom', width: 350, field: 'symptom', filter: true },
        { headerName: 'Price', field: 'cost', filter: true },
        { headerName: 'Dosage', field: 'usage', filter: true },
        { headerName: 'Ingredients', field: 'ingredient', filter: true },
        { headerName: 'Stock Quantity', field: 'existNumber', filter: true },
    ]);

    const autoSizeStrategy = useMemo(() => {
    return {
        type: 'fitGridWidth',
    };
    }, []);

    useDebounce(receivePrescriptionData, [queryByIllnessName], 1000);
    useDebounce(receiveUserData, [queryUserInfo], 1000);

    const handleBonusMedicineSaveButtonClicked = () => {
        const modal = document.getElementById('bonus_medicine_modal')
        const selectedRow = bonusMedicineRef.current.api.getSelectedRows();
        setMedicines(prevData => [
            ...prevData,
            ...selectedRow
        ])
        modal.close()
    }

    //* Display Medicine List Table from FireStore whenever the symptom name changed (applied debounce)
    useEffect(() => {
        setMedicines([]);
        const { prescriptions } = symptom;
        if (!prescriptions) return;
        prescriptions.forEach((item) => {
            getMedicineFromReference(item);
        });
    }, [symptom]);

    useEffect(() => {
        getMedicineList()
    }, [])

    return (
        <>
            <div>
                <section className='grid grid-cols-4 gap-4'>
                    <label className='form-control col-span-4 xl:col-span-2'>
                        <div className='label'>
                            <span className='label-text'>Patient Name</span>
                        </div>
                        <input
                            defaultValue={userData.name}
                            type='text'
                            placeholder='E.g: Nguyen Van A'
                            className='input input-bordered w-full'
                            disabled
                        />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-2'>
                        <div className='label'>
                            <span className='label-text'>New Customer</span>
                        </div>
                        <input type='text' defaultValue={'Yes'} placeholder='E.g: Yes' className='input input-bordered w-full' disabled />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Patient Phone Number</span>
                            <div
                                className='tooltip tooltip-info tooltip-left xl:tooltip-top'
                                data-tip='System automatically loads patient information when correct phone number is entered'
                            >
                                <FaInfoCircle className='w-4 h-4 text-sky-600 ' />
                            </div>
                        </div>
                        <input
                            type='text'
                            placeholder='Enter patient phone number'
                            className='input input-bordered w-full'
                            onChange={(e) => setQueryUserInfo(e.target.value)}
                        />
                        {errorMessage.queryUser && 
                            <div role="alert" className="alert shadow-lg mt-2">
                                <MdError className='inline w-5 h-5 text-error'/>
                                <div>
                                    <h3 className="font-bold text-error">{ errorMessage.queryUser }!</h3>
                                    <Link to={'/masterdata/patient'}>
                                        <div className="text-xs text-info underline underline-offset-8 italic">Click here to create new patient data</div>
                                    </Link>
                                </div>
                            </div>
                        }
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Patient Age</span>
                        </div>
                        <input
                            defaultValue={userData.age}
                            type='number'
                            placeholder='E.g: 8'
                            className='input input-bordered w-full'
                            disabled
                        />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Examination Code</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={userData.medicalCode}
                            placeholder='E.g: 520H0659'
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Examination Form ID</span>
                        </div>
                        <input type='text' placeholder='E.g: 520H0659' className='input input-bordered w-full'  />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Examination Date</span>
                        </div>
                        <input
                            defaultValue={getCurrentDate({}, 'en-CA')}
                            type='date'
                            className='input input-bordered w-full'
                            disabled
                        />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Follow-up Date</span>
                        </div>
                        <input
                            type='date'
                            placeholder='Enter follow-up date'
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-4 xl:col-span-2'>
                        <div className='label'>
                            <span className='label-text'>Symptom Name</span>
                            <div
                                className='tooltip tooltip-info tooltip-left'
                                data-tip='System automatically loads prescription information when correct symptom name is entered'
                            >
                                <FaInfoCircle className='w-4 h-4 text-sky-600 ' />
                            </div>
                        </div>
                        <input
                            type='text'
                            placeholder='Enter symptom name'
                            className='input input-bordered w-full'
                            onChange={(e) => setQueryByIllnessName(e.target.value)}
                        />
                    </label>
                    <label className='form-control col-span-4'>
                        <div className='label'>
                            <span className='label-text'>Symptom Description</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={symptom.description}
                            placeholder='E.g: Fatigue, body aches'
                            className='input input-bordered w-full'
                        />
                        {
                            errorMessage.queryPrescription && 
                            <div role="alert" className="alert shadow-lg mt-2">
                                <MdError className='inline w-5 h-5 text-error'/>
                                <div>
                                    <h3 className="font-bold text-error">{ errorMessage.queryPrescription }!</h3>
                                    <Link to={'/masterdata/disease'}>
                                        <div className="text-xs text-info underline underline-offset-8 italic">Click here to create new symptom data</div>
                                    </Link>
                                </div>
                            </div>
                        }
                    </label>
                </section>

                <section className='w-full mt-8'>
                    <div>
                        {medicines.length > 0 && (
                            <div className={`col-span-3`} style={{ width: '100%' }}>
                                <header>
                                    <h2 className='capitalize text-4xl font-bold text-primary text-center'>
                                        Prescription Information
                                    </h2>
                                </header>

                                <button
                                    className="btn btn-outline btn-info w-fit tooltip" data-tip="Data will not be saved to the system"
                                    onClick={()=>document.getElementById('bonus_medicine_modal').showModal()}
                                >
                                    <CiCirclePlus className='inline w-5 h-5 mr-2'/>
                                    Click to add medicine to prescription
                                </button>

                                <div className={`overflow-x-auto mt-4 mb-2 ${themeValue === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`} style={{ height: 500 }}>
                                    {/* The AG Grid component */}
                                    <AgGridReact
                                        rowData={medicines}
                                        columnDefs={colDefs}
                                        rowSelection={'multiple'}
                                        rowGroupPanelShow={'always'}
                                        autoSizeStrategy={autoSizeStrategy}
                                        pagination={true}
                                        paginationPageSize={20}
                                        paginationPageSizeSelector={[20, 50, 100]}
                                        suppressScrollOnNewData={true} //* tells the grid to NOT scroll to the top when the page changes
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <dialog id="bonus_medicine_modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div className={`col-span-3`} style={{ width: '100%' }}>
                        <header>
                            <h2 className='capitalize text-4xl font-bold text-primary text-center'>
                                Medicine List
                            </h2>
                        </header>
                        <div className={`overflow-x-auto mt-8 mb-2 ${themeValue === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`} style={{ height: 500 }}>
                            {/* The AG Grid component */}
                            <AgGridReact
                                ref={bonusMedicineRef}
                                rowData={bonusMedicineList}
                                columnDefs={colDefsBonusMedicineList}
                                rowSelection={'multiple'}
                                rowGroupPanelShow={'always'}
                                autoSizeStrategy={autoSizeStrategy}
                                pagination={true}
                                paginationPageSize={20}
                                paginationPageSizeSelector={[20, 50, 100]}
                                suppressScrollOnNewData={true}
                            />
                        </div>
                        <div className='mt-2'>
                            <button className="btn btn-success btn-block" onClick={handleBonusMedicineSaveButtonClicked}>
                                Save Data
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default MedicalCertificate;