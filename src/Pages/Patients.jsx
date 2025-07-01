import { GrPowerReset } from 'react-icons/gr';
import { FaSave, FaInfoCircle, FaHistory } from 'react-icons/fa';
import { FaEye, FaPencil, FaTrashCan } from 'react-icons/fa6';

import '../index.css';
import { AgGridReact } from 'ag-grid-react';  // React Grid Logic
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks';
import { generateRandomID, getCurrentDate } from '../utils/General';
import { collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../Configs/firebase';
import { SweetAlert } from '../utils/Alert';

// Cell renderer for the Actions column
const Actions = (params) => {
  const theme = useTheme();
  const { data, rowIndex, gridPatientsRef } = params;  // Row data and grid ref
  const patientsRef = collection(db, 'Patients');

  // Mock history data (History collection not yet in Firestore)
  const [history, setHistory] = useState([
    { visitDate: '11/25/2002', symptoms: 'Coronavirus', recordId: '2023110001_0001', total: '25,000 VND' },
    { visitDate: '09/06/2024', symptoms: 'Tonsillitis', recordId: '2023110001_0002', total: '22,000 VND' },
    { visitDate: '11/18/2020', symptoms: 'Cold',      recordId: '2023110001_0003', total: '69,000 VND' },
  ]);

  const [historyColDefs] = useState([
    { headerName: 'Visit Date',  field: 'visitDate' },
    { headerName: 'Symptoms',    field: 'symptoms' },
    { headerName: 'Record ID',   field: 'recordId' },
    { headerName: 'Total',       field: 'total' }
  ]);

  const handleRemovePatient = async () => {
    try {
      const confirmed = await SweetAlert.Toast.Confirm();
      if (!confirmed) return;

      const selected = gridPatientsRef.current.api.getSelectedRows();
      const { email } = data;
      const q = query(patientsRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => deleteDoc(doc.ref));

      // Update UI
      gridPatientsRef.current.api.applyTransaction({ remove: selected });
      SweetAlert.Toast.Success({ text: 'Patient removed successfully' });
    } catch (err) {
      SweetAlert.Message.Error({ title: 'Removal Failed', text: err.message });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between w-full h-full space-x-2">
        <button onClick={() => document.getElementById(`detail_modal_${rowIndex}`).showModal()}>
          <FaEye className="w-5 h-5 text-green-500 hover:text-green-600 transition" />
        </button>
        <button>
          <FaPencil className="w-5 h-5 text-yellow-500 hover:text-yellow-600 transition" />
        </button>
        <button onClick={() => document.getElementById(`history_modal_${rowIndex}`).showModal()}>
          <FaHistory className="w-5 h-5 text-blue-500 hover:text-blue-600 transition" />
        </button>
        <button onClick={handleRemovePatient}>
          <FaTrashCan className="w-5 h-5 text-red-500 hover:text-red-600 transition" />
        </button>
      </div>

      {/* Detail Modal */}
      <dialog id={`detail_modal_${rowIndex}`} className="modal">
        <div className="modal-box max-w-4xl p-6">
          <header className="mb-4 text-center">
            <h3 className="text-2xl font-bold">Patient Details</h3>
            <div className="avatar placeholder mt-4 mx-auto">
              <div className="bg-gray-300 text-white w-24 h-24 rounded-full flex items-center justify-center">
                <span className="text-3xl">M</span>
              </div>
            </div>
          </header>
          <form method="dialog" className="absolute top-3 right-3">
            <button className="btn btn-circle btn-sm btn-ghost">✕</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text">ID</span>
              <input disabled value={data.id} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Medical Record Code</span>
              <input disabled value={data.medicalCode} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Full Name</span>
              <input disabled value={data.name} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Email</span>
              <input disabled value={data.email} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Age</span>
              <input disabled value={data.age} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Address</span>
              <input disabled value={data.address} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Created On</span>
              <input disabled value={data.createdDate} className="input input-bordered w-full" />
            </label>
            <label className="form-control">
              <span className="label-text">Last Updated</span>
              <input disabled value={data.updatedDate} className="input input-bordered w-full" />
            </label>
          </div>

          <button className="btn btn-success w-full mt-6">Update</button>
        </div>
      </dialog>

      {/* History Modal */}
      <dialog id={`history_modal_${rowIndex}`} className="modal">
        <div className="modal-box max-w-4xl p-6">
          <h3 className="text-2xl font-bold text-center">
            History for <span className="text-primary">{data.name}</span>
          </h3>

          <div className={`mt-6 ${theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}`} style={{ height: 400 }}>
            <AgGridReact
              rowData={history}
              columnDefs={historyColDefs}
              rowSelection="multiple"
              pagination
              paginationPageSize={10}
            />
          </div>

          <form method="dialog" className="absolute top-3 right-3">
            <button className="btn btn-circle btn-sm btn-ghost">✕</button>
          </form>
        </div>
      </dialog>
    </>
  );
};

const Patients = () => {
  const gridRef = useRef();
  const today = getCurrentDate();  // for inserting
  const theme = useTheme();
  const newId = generateRandomID().toUpperCase();

  const inputs = {
    name: useRef(null),
    phone: useRef(null),
    age: useRef(null),
    address: useRef(null),
    email: useRef(null),
  };

  const checkboxSelection = params => params.api.getRowGroupColumns().length === 0;
  const headerCheckboxSelection = checkboxSelection;

  const [rowData, setRowData] = useState([]);
  const [colDefs] = useState([
    { headerName: 'Full Name', field: 'name', width: 300, filter: true, pinned: 'left', checkboxSelection, headerCheckboxSelection },
    { headerName: 'Phone', field: 'phoneNumber' },
    { headerName: 'Age', field: 'age', filter: true },
    { headerName: 'Address', field: 'address', filter: true },
    { headerName: 'Record Code', field: 'medicalCode', filter: true },
    { headerName: 'Created On', field: 'createdDate', filter: true, sort: 'desc' },
    { headerName: 'Last Updated', field: 'updatedDate', filter: true },
    { field: '', cellRenderer: Actions, width: 250, cellRendererParams: { gridPatientsRef: gridRef } },
  ]);

  const fetchPatients = async () => {
    const snapshot = await getDocs(collection(db, 'Patients'));
    const patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setRowData(patients.map(p => ({
      id: p.id,
      name: p.name,
      phoneNumber: `0${p.phoneNumber}`,
      age: p.age,
      address: p.address,
      medicalCode: p.medicalCode,
      email: p.email,
      createdDate: p.createdDate,
      updatedDate: p.updatedDate,
    })));
  };

  const addPatient = async () => {
    try {
      await addDoc(collection(db, 'Patients'), {
        name: inputs.name.current.value,
        phoneNumber: Number(inputs.phone.current.value),
        age: Number(inputs.age.current.value),
        address: inputs.address.current.value,
        email: inputs.email.current.value || null,
        medicalCode: newId,
        createdDate: today,
        updatedDate: today,
      });
      SweetAlert.Toast.Success({ text: 'New patient added' });
      setRowData(prev => [...prev, {
        name: inputs.name.current.value,
        phoneNumber: inputs.phone.current.value,
        age: Number(inputs.age.current.value),
        address: inputs.address.current.value,
        medicalCode: newId,
        createdDate: today,
        updatedDate: today,
      }]);
    } catch (err) {
      SweetAlert.Message.Error({ title: 'Failed to add', text: err.message });
    }
  };

  const resetForm = () => Object.values(inputs).forEach(r => r.current.value = '');
  const closeDialog = id => document.querySelector(id).close();

  useEffect(() => { closeDialog('#patient_dialog'); resetForm(); }, [rowData]);
  useEffect(() => { fetchPatients(); }, []);

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-0">
      <section className="col-span-3 mt-4">
        <button className="btn btn-success w-full" onClick={() => document.getElementById('patient_dialog').showModal()}>
          Add New Patient
        </button>
      </section>

      <section className="col-span-3">
        <div className="divider divider-primary uppercase"></div>
      </section>

      <div className={`col-span-3 font-sans ${theme==='dark' ? 'ag-theme-alpine-dark':'ag-theme-alpine'}`} style={{width:'100%',height:450}}>
        <h3 className="text-3xl font-extrabold text-primary text-center uppercase mb-4">Patient List</h3>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          rowSelection="multiple"
          rowGroupPanelShow="always"
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[20,50,100]}
          suppressScrollOnNewData
          reactiveCustomComponents
          tooltipShowDelay={0}
          tooltipHideDelay={2000}
        />
      </div>

      <dialog id="patient_dialog" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <form method="dialog" className="absolute top-2 right-2">
            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
          </form>
          <h3 className="text-2xl font-extrabold text-center uppercase text-primary mb-4">New Patient Form</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="form-control w-full">
              <span className="label-text">Full Name</span>
              <input type="text" placeholder="Enter full name" className="input input-bordered w-full" ref={inputs.name} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Phone Number</span>
              <input type="number" placeholder="Enter phone number" className="input input-bordered w-full" ref={inputs.phone} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Age</span>
              <input type="number" placeholder="Enter age" className="input input-bordered w-full" ref={inputs.age} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Address</span>
              <input type="text" placeholder="Enter address" className="input input-bordered w-full" ref={inputs.address} />
            </label>
            <label className="form-control w-full">
              <div className="label flex items-center">
                <span className="label-text">Record Code</span>
                <FaInfoCircle className="ml-2" title="Auto-generated" />
              </div>
              <input type="text" value={newId} disabled className="input input-bordered w-full bg-gray-100" />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Email</span>
              <input type="email" placeholder="Enter email" className="input input-bordered w-full" ref={inputs.email} />
            </label>
          </div>
          <div className="grid grid-cols-6 mt-8 gap-4 md:gap-8">
            <button type="button" className="btn btn-error col-span-6 md:col-span-2 order-2 md:order-1 uppercase flex justify-center items-center" onClick={resetForm}>
              Reset <GrPowerReset className="ml-2 h-5 w-5" /></button>
            <button type="button" className="btn btn-success col-span-6 md:col-span-4 order-1 md:order-2 uppercase flex justify-center items-center" onClick={addPatient}>
              Save <FaSave className="ml-2 h-5 w-5" /></button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Patients;
