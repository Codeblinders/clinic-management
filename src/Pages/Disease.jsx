import { FaSave, FaInfoCircle } from 'react-icons/fa';
import { GrPowerReset } from 'react-icons/gr';
import { FaEye, FaPencil, FaTrashCan } from 'react-icons/fa6';

import { AgGridReact } from 'ag-grid-react'; //* React Grid Logic
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '../hooks';
import { getCurrentDate, generateRandomID, formatCurrency } from '../utils/General';
import { collection, getDocs, getDoc, doc, addDoc, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../Configs/firebase';
import { SweetAlert } from '../utils/Alert';

//* Cell Rendering:Actions column
const Actions = (params) => {
    const themeValue = useTheme();
    const { data, rowIndex, gridPrescriptionListRef } = params;
    const symptomsRef = collection(db, 'Symptoms'); //* Create a reference to the Symptoms collection
    const [medicineList, setMedicineList] = useState([]);

    //* Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
        {
            headerName: 'Medicine Name',
            field: 'name',
            wrapText: true,
            autoHeight: true,
            pinned: 'left',
            filter: true,
        },
        { headerName: 'Symptom', field: 'symptom', filter: true },
        {
            headerName: 'Price',
            valueGetter: (params) => {
                return formatCurrency(params.data.cost);
            },
            filter: true,
        },
        { headerName: 'Dosage', field: 'usage', filter: true },
        { headerName: 'Ingredients', field: 'ingredient', filter: true },
    ]);

    const getMedidineInfoFromReferenceDocument = () => {
        data.prescriptions.forEach(async (reference) => {
            const docRef = doc(db, reference.path);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // docSnap.data() will be undefined in this case
                console.log('No such medicine document');
                return;
            }

            const medicine = docSnap.data();

            setMedicineList((prevData) => [...prevData, medicine]);
        });
    };

    const handleRemovePrescription = async () => {
        try {
            const isConfirm = await SweetAlert.Toast.Confirm();

            // User rejected case
            if (!isConfirm) return;

            const selectedRow = gridPrescriptionListRef.current.api.getSelectedRows();
            const { code } = data; // Take the code field in the document

            // Create a query against the collection.
            const q = query(symptomsRef, where('code', '==', code));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const { ref } = doc;
                deleteDoc(ref);
            });

            // Remove the selected row in UI
            // This code is served for updating UI instantly
            gridPrescriptionListRef.current.api.applyTransaction({ remove: selectedRow });

            SweetAlert.Toast.Success({ text: 'Successfully deleted data' });
        } catch (error) {
            SweetAlert.Message.Error({ title: 'Failed to delete data', text: error.message });
        }
    };

    useEffect(() => {
        // Grab the Medicine Information from the Ref Document when the component first mounted
        getMedidineInfoFromReferenceDocument();
    }, []);

    return (
        <>
            <div className='flex items-center justify-between w-full h-full'>
                <button onClick={() => document.getElementById(`detail_modal_${rowIndex}`).showModal()}>
                    <FaEye className='w-5 h-5 text-green-400' />
                </button>
                <button>
                    <FaPencil className='w-5 h-5 text-yellow-400' />
                </button>
                <button onClick={handleRemovePrescription}>
                    <FaTrashCan className='w-5 h-5 text-red-400' />
                </button>
            </div>

            {/* Detail Data Modal  */}
            <dialog id={`detail_modal_${rowIndex}`} className='modal'>
                <div className='modal-box w-11/12 max-w-5xl'>
                    <form method='dialog'>
                        {/* if there is a button in form, it will close the modal */}
                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                    </form>

                    <h3 className='font-extrabold text-2xl text-center mb-4 uppercase text-primary'>
                        Prescription Details
                    </h3>

                    {/* MasterData Input */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='col-span-2 xl:col-span-1'>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Prescription Code</span>
                                </div>
                                <input
                                    disabled
                                    defaultValue={data.code}
                                    type='text'
                                    placeholder='E.g: 520H0659'
                                    className='input input-bordered w-full'
                                />
                            </label>
                        </div>
                        <div className='col-span-2 xl:col-span-1'>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Disease Symptom</span>
                                </div>
                                <input
                                    type='text'
                                    disabled
                                    defaultValue={data.name}
                                    placeholder='E.g: Fever'
                                    className='input input-bordered w-full'
                                />
                            </label>
                        </div>
                        <div className='col-span-2 xl:col-span-1'>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Creation Date</span>
                                </div>
                                <input
                                    type='text'
                                    disabled
                                    defaultValue={data.createdDate}
                                    placeholder='E.g: 1/1/2024'
                                    className='input input-bordered w-full'
                                />
                            </label>
                        </div>
                        <div className='col-span-2 xl:col-span-1'>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Last Update Date</span>
                                </div>
                                <input
                                    type='text'
                                    disabled
                                    defaultValue={data.updatedDate}
                                    placeholder='E.g: 1/1/2024'
                                    className='input input-bordered w-full'
                                />
                            </label>
                        </div>
                        <div className='col-span-2'>
                            <textarea
                                disabled
                                placeholder='Symptom description'
                                defaultValue={data.description}
                                className='textarea textarea-bordered textarea-lg w-full'
                            ></textarea>
                        </div>
                        <div className='col-span-2'>
                            <div className='collapse collapse-arrow bg-base-200'>
                                <input type='checkbox' />
                                <div className='collapse-title text-xl font-medium'>
                                    Medicines in this prescription
                                </div>
                                <div className='collapse-content'>
                                    <div
                                        className={`col-span-3 ${
                                            themeValue === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'
                                        }`}
                                        style={{ width: '100%', height: 450 }}
                                    >
                                        {/* The AG Grid component */}
                                        <AgGridReact
                                            rowData={medicineList}
                                            columnDefs={colDefs}
                                            rowSelection={'multiple'}
                                            rowGroupPanelShow={'always'}
                                            pagination={true}
                                            paginationPageSize={20}
                                            paginationPageSizeSelector={[20, 50, 100]}
                                            suppressScrollOnNewData={true} //* tells the grid to NOT scroll to the top when the page changes.
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    );
};

const Disease = () => {
    const gridRef = useRef(); // Medicine Instance in Create Modal
    const gridPrescriptionListRef = useRef(); // Prescription List instance
    const themeValue = useTheme();
    const generateID = generateRandomID().toUpperCase();
    const currentDate = getCurrentDate();
    const [medicineList, setMedicineList] = useState([]); //* Store all medicines in db to display them in Create Modal

    //* Big Data Object (Entire Form)
    const data = {
        name: useRef(null),
        description: useRef(null),
    };

    const isFirstColumn = (params) => {
        const displayedColumns = params.api.getAllDisplayedColumns();
        const thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    };

    const checkboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    const headerCheckboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    const onQuickFilterChanged = useCallback(() => {
        gridRef.current.api.setGridOption('quickFilterText', document.getElementById('quickFilter').value);
    }, []);

    //* Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([]);

    //* Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
        {
            headerName: 'Prescription Code',
            field: 'code',
            wrapText: true,
            autoHeight: true,
            pinned: 'left',
            filter: true,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        { headerName: 'Disease Type', field: 'name', wrapText: true, filter: true },
        { headerName: 'Description', field: 'description', wrapText: true, filter: true },
        {
            headerName: 'Creation Date',
            field: 'createdDate',
            wrapText: true,
            filter: true,
            sort: 'desc',
            sortingOrder: ['desc', 'asc'],
        },
        { headerName: 'Last Update Date', field: 'updatedDate', wrapText: true, filter: true },
        {
            field: '',
            cellRenderer: Actions,
            width: 150,
            cellRendererParams: {
                gridPrescriptionListRef,
            },
        },
    ]);

    //* Column Definitions: Defines & controls grid columns.
    const [colDefsMedicineList, setColDefsMedicineList] = useState([
        {
            headerName: 'Medicine Name',
            width: 350,
            field: 'name',
            autoHeight: true,
            pinned: 'left',
            filter: true,
        },
        { headerName: 'Symptom', width: 350, field: 'symptom', filter: true },
        { headerName: 'Price', field: 'cost', filter: true },
        { headerName: 'Dosage', field: 'usage', filter: true },
        { headerName: 'Ingredients', field: 'ingredient', filter: true },
        { headerName: 'Stock Quantity', field: 'existNumber', filter: true },
    ]);

    const defaultColDef = useMemo(() => {
        return {
            headerCheckboxSelection: isFirstColumn,
            checkboxSelection: isFirstColumn,
            headerCheckboxSelectionFilteredOnly: true,
        };
    }, []);

    //* Make the AGGrid content automatically resize to fit the grid container size
    const autoSizeStrategy = {
        type: 'fitGridWidth',
        defaultMinWidth: 100,
    };

    //* Get Symptom List from Firebase Server (FireStore - Symptoms Collection)
    const getSymptomList = async () => {
        const querySnapshot = await getDocs(collection(db, 'Symptoms'));
        querySnapshot.forEach((doc) => {
            const disease = doc.data();

            setRowData((prevData) => [
                ...prevData,
                {
                    name: disease.name,
                    description: disease.description,
                    code: disease.code,
                    createdDate: disease.createdDate,
                    updatedDate: disease.updatedDate,
                    prescriptions: disease.prescriptions,
                },
            ]);
        });
    };

    //* Get Medicine List from Firebase Server (FireStore - Medicines Collection)
    //* Used when user open the Create Modal in Disease Page and selected
    //* medicine in the table will be consider as medicine for that specific prescription
    const getMedicineList = async () => {
        const querySnapshot = await getDocs(collection(db, 'Medicines'));
        querySnapshot.forEach((doc) => {
            const medicine = doc.data();
            medicine.cost = formatCurrency(Number(medicine.cost)); // Format the currency property in VND format
            medicine.ref = doc.ref; //* Attach the ref property to object pass it as reference datatype to FireStore
            setMedicineList((prevData) => [...prevData, medicine]);
        });
    };

    const filterReferencePath = (selectedRow) => {
        const refList = []; //* Store reference instance from the selected Medicine Row in Table
        selectedRow.forEach((item) => {
            const { ref } = item;
            refList.push(ref);
        });
        return refList;
    };

    const updateMedicineExistNumber = (refList) => {
        refList.forEach(async (item) => {
            const docRef = doc(db, item.path);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // docSnap.data() will be undefined in this case
                console.log('No such medicine document!');
                return;
            }

            const medicine = docSnap.data();
            // Update the existNumber field in Medicine Document
            // when user choose this medicine for a prescription (minus 1)
            await updateDoc(docRef, {
                existNumber: medicine.existNumber - 1,
            });
        });
    };

    const submitCreatedData = async () => {
        //* Get the selected row from Table using their API
        const selectedRow = gridRef.current.api.getSelectedRows();
        const refList = filterReferencePath(selectedRow);
        await addDoc(collection(db, 'Symptoms'), {
            name: data.name.current.value.toLowerCase(),
            description: data.description.current.value,
            code: generateID,
            createdDate: currentDate,
            updatedDate: currentDate,
            prescriptions: [...refList],
        });

        updateMedicineExistNumber(refList);

        setRowData((prevData) => [
            ...prevData,
            {
                name: data.name.current.value,
                description: data.description.current.value,
                code: generateID,
                createdDate: currentDate,
                updatedDate: currentDate,
                prescriptions: [...refList],
            },
        ]);
        SweetAlert.Toast.Success({ text: 'Successfully created data' });
    };

    const refreshData = () => {
        data.description.current.value = '';
        data.name.current.value = '';
    };

    // User can only select row that has medicine whose existNumber is greater than 0
    // Those with the opposite case will be disabled (non selectable)
    const isRowSelectable = useMemo(() => {
        return (params) => {
            return !!params.data && params.data.existNumber !== 0;
        };
    }, []);

    // Highlight row that has medicine number equal to 0
    const getRowClass = (params) => {
        const { data } = params;
        if (data.existNumber === 0) {
            return 'bg-red-100 text-black'; // Tailwind CSS class
        }
    };

    const closeModal = (modalID) => {
        const dialog = document.querySelector(modalID);
        dialog.close();
    };

    useEffect(() => {
        // Close the modal after created and reset its values
        closeModal('#masterdata_disease_dialog');
        refreshData();
    }, [rowData]);

    //* Get Symptom List when component first mounted
    //* The same for Medicine list since this will be displayed
    //* in the table inside Create Modal
    useEffect(() => {
        getSymptomList();
        getMedicineList();
    }, []);

    return (
        <div className='grid grid-cols-1 gap-4 md:gap-0'>
            <section className='col-span-1 mt-4'>
                <button
                    className='btn btn-success w-full'
                    onClick={() => document.getElementById('masterdata_disease_dialog').showModal()}
                >
                    Create New Data
                </button>
            </section>

            <section className='col-span-1'>
                <div className='divider divider-primary w-full uppercase'></div>
            </section>

            {/* Table Section  */}
            <section className='col-span-1'>
                <div
                    className={`col-span-3 ${themeValue === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}
                    style={{ width: '100%', height: 450 }}
                >
                    <h3 className='font-extrabold text-3xl text-primary text-center uppercase mb-4'>
                        Prescription List
                    </h3>

                    {/* The AG Grid component */}
                    <AgGridReact
                        ref={gridPrescriptionListRef}
                        rowData={rowData}
                        columnDefs={colDefs}
                        autoSizeStrategy={autoSizeStrategy}
                        rowSelection={'multiple'}
                        rowGroupPanelShow={'always'}
                        pagination={true}
                        paginationPageSize={20}
                        paginationPageSizeSelector={[20, 50, 100]}
                        suppressScrollOnNewData={true} //* tells the grid to NOT scroll to the top when the page changes.
                    />
                </div>
            </section>

            {/* Create Data Modal */}
            <dialog id='masterdata_disease_dialog' className='modal'>
                <div className='modal-box w-11/12 max-w-5xl'>
                    <form method='dialog'>
                        {/* if there is a button in form, it will close the modal */}
                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                    </form>

                    <h3 className='font-bold text-2xl text-center mb-4 uppercase text-primary'>
                        New Prescription Form
                    </h3>

                    {/* MasterData Input */}
                    <div className='grid grid-cols-1'>
                        <section className='col-span-1'>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Symptom Name</span>
                                </div>
                                <input
                                    type='text'
                                    placeholder='Enter symptom name'
                                    className='input input-bordered w-full'
                                    ref={data.name}
                                />
                            </label>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Symptom Description</span>
                                </div>
                                <input
                                    type='text'
                                    placeholder='Enter symptom description'
                                    className='input input-bordered w-full'
                                    ref={data.description}
                                />
                            </label>
                            <label className='form-control w-full'>
                                <div className='label'>
                                    <span className='label-text'>Prescription Code</span>
                                    <div
                                        className='tooltip tooltip-info tooltip-left'
                                        data-tip='Prescription code is automatically generated by the system'
                                    >
                                        <FaInfoCircle className='w-4 h-4 text-sky-600 ' />
                                    </div>
                                </div>
                                <input
                                    type='text'
                                    disabled
                                    className='input input-bordered w-full'
                                    defaultValue={generateID}
                                />
                            </label>
                        </section>

                        <section className='col-span-1'>
                            <div className='divider divider-primary w-full uppercase'>or</div>
                        </section>

                        {/* Medicine List Section  */}
                        <section className='col-span-1'>
                            <h3 className='font-extrabold text-2xl text-primary text-center uppercase mb-4'>
                                Available Medicines
                            </h3>

                            <div className='my-8'>
                                <label className='input input-bordered flex items-center gap-2'>
                                    <input
                                        type='text'
                                        className='grow'
                                        onInput={onQuickFilterChanged}
                                        id='quickFilter'
                                        placeholder='Search medicines...'
                                    />
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        viewBox='0 0 16 16'
                                        fill='currentColor'
                                        className='w-4 h-4 opacity-70'
                                    >
                                        <path
                                            fillRule='evenodd'
                                            d='M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </label>
                            </div>

                            <div
                                className={`col-span-3 overflow-x-auto ${
                                    themeValue === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'
                                }`}
                                style={{ width: '100%', height: 450 }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={medicineList}
                                    columnDefs={colDefsMedicineList}
                                    defaultColDef={defaultColDef}
                                    autoSizeStrategy={autoSizeStrategy}
                                    isRowSelectable={isRowSelectable}
                                    getRowClass={getRowClass} // Highlight row that has existNumber equal to 0
                                    rowSelection={'multiple'}
                                    rowMultiSelectWithClick={true}
                                    rowGroupPanelShow={'always'}
                                    pagination={true}
                                    paginationPageSize={20}
                                    paginationPageSizeSelector={[20, 50, 100]}
                                    suppressScrollOnNewData={true} //* tells the grid to NOT scroll to the top when the page changes.
                                />
                            </div>
                        </section>
                    </div>

                    <div className='grid grid-cols-6 mt-8 gap-4 md:gap-8'>
                        <button
                            className='btn btn-error col-span-6 md:col-span-2 order-2 md:order-1 uppercase'
                            onClick={refreshData}
                        >
                            Reset Data
                            <GrPowerReset className='h-5 w-5' />
                        </button>
                        <button
                            className='btn btn-success col-span-6 md:col-span-4 order-1 md:order-2 uppercase'
                            onClick={submitCreatedData}
                        >
                            Save Data
                            <FaSave className='h-5 w-5' />
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default Disease;