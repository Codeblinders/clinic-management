import Patient from '../Assets/Patient_Home_Logo.jpg';
import Disease from '../Assets/Disease_Home_Logo.jpg';
import Receipt from '../Assets/Receipt_Home_Logo.jpg';
import Medicine from '../Assets/Medicine_Home_Logo.jpg';

const HomeData = [
    {
        name: 'Patient Master Data',
        img: Patient,
        link: '/masterdata/patient',
    },
    {
        name: 'Medicine Master Data',
        img: Medicine,
        link: '/masterdata/medicine',
    },
    {
        name: 'Symptoms Master Data',
        img: Disease,
        link: '/masterdata/disease',
    },
    {
        name: 'Medical Examination Form',
        img: Receipt,
        link: '/masterdata/medicalCertificate',
    },
];

//! Remember to configure the theme in TailwindCSS config file when adding a new theme
const Themes = [
    {
        label: 'Light',
        value: 'light',
        theme: 'light',
    },
    {
        label: 'Sunset',
        value: 'sunset',
        theme: 'dark',
    },
    {
        label: 'Cupcake',
        value: 'cupcake',
        theme: 'light',
    },
    {
        label: 'Dracula',
        value: 'dracula',
        theme: 'dark',
    },
];

export { HomeData, Themes };
