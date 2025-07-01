import { FaEye, FaPencil, FaTrashCan } from 'react-icons/fa6';
import { GrPowerReset } from 'react-icons/gr';
import { FaSave } from 'react-icons/fa';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../hooks';
import { AgGridReact } from 'ag-grid-react'; //* React Grid Logic
import { db } from '../Configs/firebase';
import { collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { SweetAlert } from '../utils/Alert';
import { formatCurrency, getCurrentDate } from '../utils/General';

//* Cell Rendering:Actions column
const Actions = (params) => {
    const { data, gridMedicineRef } = params;
    const medicinesRef = collection(db, 'Medicines'); //* Create a reference to the Medicines collection

const handleRemoveMedicine = async () => {
    try {
        const isConfirm = await SweetAlert.Toast.Confirm();
        // User rejected case
        if (!isConfirm) return;

        const selectedRow = gridMedicineRef.current.api.getSelectedRows();
        const { symptom } = data; // Take the symptom field in the document
        // Create a query against the collection.
        const q = query(medicinesRef, where('symptom', '==', symptom));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const { ref } = doc;
            deleteDoc(ref);
        });

        // Remove the selected row in UI
        // This code is served for updating UI instantly
        gridMedicineRef.current.api.applyTransaction({ remove: selectedRow });
        SweetAlert.Toast.Success({ title: 'Successfully created new data' });
    } catch (error) {
        SweetAlert.Message.Error({ title: 'Failed to delete data', text: error.message });
    }
};

return (
    <>
        <div className={`flex items-center justify-between w-full h-full`}>
            <button onClick={() => document.getElementById(`detail_modal_${data.name}`).showModal()}>
                <FaEye className='w-5 h-5 text-green-400' />
            </button>
            <button>
                <FaPencil className='w-5 h-5 text-yellow-400' />
            </button>
            <button onClick={handleRemoveMedicine}>
                <FaTrashCan className={`w-5 h-5 ${data.existNumber === 0 ? 'text-red-600' : 'text-red-400'} `} />
            </button>
        </div>

        {/* Detail Modal */}
        <dialog id={`detail_modal_${data.name}`} className='modal'>
            <div className='modal-box w-11/12 max-w-5xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <h3 className='font-bold text-2xl text-center mb-4 uppercase text-primary'>
                    detailed medicine information
                </h3>

                <div className='grid grid-cols-2 gap-4'>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Medicine Name</span>
                        </div>
                        <input disabled type='text' value={data.name} className='input input-bordered w-full' />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Concentration</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.concentration}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Dosage</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.usage}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Inventory Quantity</span>
                        </div>
                        <input
                            disabled
                            type='number'
                            defaultValue={data.existNumber}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Ingredient</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.ingredient}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Price</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.cost}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Data Created Date</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.createdDate}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2 lg:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Data Updated Date</span>
                        </div>
                        <input
                            disabled
                            type='text'
                            defaultValue={data.updatedDate}
                            className='input input-bordered w-full'
                        />
                    </label>
                    <label className='form-control col-span-2'>
                        <div className='label'>
                            <span className='label-text'>Symptom Description</span>
                        </div>
                        <textarea
                            disabled
                            className='textarea textarea-bordered textarea-lg w-full'
                            defaultValue={data.symptom}
                        ></textarea>
                    </label>
                </div>
            </div>
        </dialog>
    </>
);
}

const Medicine = () => {
    const currentDate = getCurrentDate();
    const gridMedicineRef = useRef();
    const themeValue = useTheme();
    const data = {
        name: useRef(''), 
        symptom: useRef(''), 
        ingredient: useRef(''), 
        cost: useRef(''), 
        concentration: useRef(''), 
        usage: useRef(''), 
        existNumber: useRef(''),
    };

    const checkboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    const headerCheckboxSelection = function (params) {
        //* we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
    };

    //* Row Data: The data to be displayed in Table.
    const [rowData, setRowData] = useState([]);

    //* Column Definitions: Defines & controls grid columns.
const [colDefs, setColDefs] = useState([
    {
        headerName: 'Medicine Name',
        width: 500,
        field: 'name',
        wrapText: true,
        autoHeight: true,
        pinned: 'left',
        filter: true,
        showDisabledCheckboxes: true,
        checkboxSelection: checkboxSelection,
        headerCheckboxSelection: headerCheckboxSelection,
    },
    { headerName: 'Symptom', field: 'symptom', wrapText: true, filter: true },
    { headerName: 'Ingredient', field: 'ingredient', wrapText: true, filter: true },
    { headerName: 'Concentration', field: 'concentration', wrapText: true, filter: true },
    { headerName: 'Dosage', field: 'usage', wrapText: true, filter: true },
    {
        headerName: 'Inventory Quantity',
        field: 'existNumber',
        filter: true,
        cellStyle: (params) => {
            const { data } = params;
            if (data.existNumber === 0) {
                // mark exist number = 0 cells as red
                return { color: '#FFFF', backgroundColor: '#cc222244', fontWeight: 600 };
            }
            return null;
        },
    },
    { headerName: 'Price per Unit', field: 'cost', filter: true },
    { headerName: 'Created Date', field: 'createdDate', sort: 'desc', filter: true },
    { headerName: 'Last Updated Date', field: 'updatedDate', filter: true },
    {
        field: '',
        cellRenderer: Actions,
        // Pass data to Actions Component
        cellRendererParams: {
            gridMedicineRef, // Medicine List Table Instance
        },
    },
]);


    //* Make the AGGrid content automatically resize to fit the grid container size
    const autoSizeStrategy = {
        type: 'fitGridWidth',
        defaultMinWidth: 100,
    };

    const refreshData = () => {
        data.name.current.value = '';
        data.symptom.current.value = '';
        data.ingredient.current.value = '';
        data.concentration.current.value = '';
        data.usage.current.value = '';
        data.existNumber.current.value = '';
        data.cost.current.value = '';
    };

    //* Get Medicine List from Firebase Server (FireStore - Medicines Collection)
    const getMedicineList = async () => {
        const querySnapshot = await getDocs(collection(db, 'Medicines'));
        querySnapshot.forEach((doc) => {
            const medicine = doc.data();
            setRowData((prevData) => [
                ...prevData,
                {
                    name: medicine.name,
                    symptom: medicine.symptom,
                    ingredient: medicine.ingredient,
                    concentration: medicine.concentration,
                    usage: medicine.usage,
                    existNumber: medicine.existNumber,
                    cost: formatCurrency(Number(medicine.cost)),
                    createdDate: medicine.createdDate,
                    updatedDate: medicine.updatedDate,
                },
            ]);
        });
    };

    const submitCreatedData = async () => {
        try {
            const docRef = await addDoc(collection(db, 'Medicines'), {
                name: data.name.current.value,
                symptom: data.symptom.current.value,
                ingredient: data.ingredient.current.value,
                concentration: data.concentration.current.value,
                usage: data.usage.current.value,
                existNumber: Number(data.existNumber.current.value),
                cost: Number(data.cost.current.value),
                createdDate: currentDate,
                updatedDate: currentDate,
            });
            SweetAlert.Toast.Success({ title: 'Thêm mới dữ liệu thành công' });

            setRowData((prevRowData) => {
                return [
                    ...prevRowData,
                    {
                        name: data.name.current.value,
                        symptom: data.symptom.current.value,
                        ingredient: data.ingredient.current.value,
                        concentration: data.concentration.current.value,
                        usage: data.usage.current.value,
                        existNumber: Number(data.existNumber.current.value),
                        cost: Number(data.cost.current.value),
                        createdDate: currentDate,
                        updatedDate: currentDate,
                    },
                ];
            });
        } catch (error) {
            SweetAlert.Message.Error({ title: 'Tạo dữ liệu thất bại', text: error.message });
        }
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

    const closeModal = (modalID) =>  {
        const dialog = document.querySelector(modalID);
        dialog.close();
    }

    useEffect(() => {
        //* Close modal after save data successfully
        //* And clear the data
        closeModal('#masterdata_medicine_dialog')
        refreshData();
    }, [rowData]);

    //* Get Medicine List when component first mounted
    useEffect(() => {
        getMedicineList();
    }, []);

return (
    <div className='grid grid-cols-3 gap-4 md:gap-0'>
        <section className='col-span-3 mt-4'>
            <button
                className='btn btn-success w-full'
                onClick={() => document.getElementById('masterdata_medicine_dialog').showModal()}
            >
                Create New Data
            </button>
        </section>

        <section className='col-span-3'>
            <div className='divider divider-primary uppercase'></div>
        </section>

        {/* Table Section  */}
        <section className='col-span-3'>
            {/* Container with theme & dimensions */}
            <div
                className={`col-span-3 overflow-x-scroll ${themeValue === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`}
                style={{ width: '100%', height: 450 }}
            >
                <h3 className='font-extrabold text-3xl text-primary text-center uppercase mb-4'>
                    Medicine List
                </h3>

                {/* The AG Grid component */}
                <AgGridReact
                    ref={gridMedicineRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    autoSizeStrategy={autoSizeStrategy}
                    rowSelection={'multiple'}
                    rowGroupPanelShow={'always'}
                    isRowSelectable={isRowSelectable}
                    getRowClass={getRowClass} // Highlight row that has existNumber equal to 0
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[20, 50, 100]}
                    suppressScrollOnNewData={true} //* tells the grid to NOT scroll to the top when the page changes.
                />
            </div>
        </section>

        {/* Dialog Section */}
        <dialog id='masterdata_medicine_dialog' className='modal'>
            <div className='modal-box w-11/12 max-w-5xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <h3 className='font-bold text-2xl text-center mb-4 uppercase text-primary'>
                    Add New Medicine Form
                </h3>

                {/* MasterData Input */}
                <div className='grid grid-cols-2 gap-3'>
                    <div className='col-span-2'>
                        <label className='form-control w-full'>
                            <div className='label'>
                                <span className='label-text'>Medicine Name</span>
                            </div>
                            <input
                                type='text'
                                placeholder='Please enter medicine name'
                                className='input input-bordered w-full'
                                ref={data.name}
                            />
                        </label>
                    </div>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Symptom</span>
                        </div>
                        <input
                            type='tel'
                            placeholder='Please enter symptom'
                            className='input input-bordered w-full'
                            ref={data.symptom}
                        />
                    </label>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Ingredient</span>
                        </div>
                        <input
                            type='text'
                            placeholder='Please enter ingredient'
                            className='input input-bordered w-full'
                            ref={data.ingredient}
                        />
                    </label>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Price</span>
                        </div>
                        <input
                            type='number'
                            placeholder='Please enter price'
                            className='input input-bordered w-full'
                            ref={data.cost}
                        />
                    </label>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Concentration</span>
                        </div>
                        <input
                            type='text'
                            placeholder='Please enter concentration'
                            className='input input-bordered w-full'
                            ref={data.concentration}
                        />
                    </label>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Dosage</span>
                        </div>
                        <input
                            type='text'
                            placeholder='Please enter dosage'
                            className='input input-bordered w-full'
                            ref={data.usage}
                        />
                    </label>
                    <label className='form-control w-full col-span-2 xl:col-span-1'>
                        <div className='label'>
                            <span className='label-text'>Inventory Quantity</span>
                        </div>
                        <input
                            type='number'
                            placeholder='Please enter inventory quantity'
                            min={0}
                            className='input input-bordered w-full'
                            ref={data.existNumber}
                        />
                    </label>
                </div>
            

                    <div className='grid grid-cols-6 mt-8 gap-4 md:gap-8'>
                        <button
                            className='btn btn-error col-span-6 md:col-span-2 order-2 md:order-1 uppercase'
                            onClick={refreshData}
                        >
                            Refresh Data
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

export default Medicine;
