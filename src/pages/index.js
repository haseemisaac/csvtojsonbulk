import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { FileUpload } from 'primereact/fileupload';
import { Card } from 'primereact/card'

const inter = Inter({ subsets: ['latin'] })

function FileUploadMultiple() {

  const handleUploadClick = async (event) => {
    console.log(event)
    const options = event.options;
    const fileList = event.files
    const files = fileList ? [...fileList] : [];
    // 👇 Create new FormData object and append files
    const data = new FormData();
    files.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });

    // 👇 Uploading the files using the fetch API to the server
    fetch('./api/processor', {
      method: 'POST',
      body: data,
      }).then(res => {
        if (res.status != 200) { throw new Error("Bad server response"); }
        return res.blob();
      }).then((data) => {
        const url = window.URL.createObjectURL(data),
        anchor = document.createElement("a");
        anchor.href = url;
        
        anchor.download = "output.zip";
        anchor.click();

        window.URL.revokeObjectURL(url);
        document.removeChild(anchor);
        
      }).catch(err => console.error(err));
      options.clear();
  };

  return (
    <div>
      <FileUpload 
        name="csvFiles" 
        customUpload
        multiple 
        accept=".csv" 
        maxFileSize={1000000} 
        emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} 
        uploadHandler={(event) => handleUploadClick(event)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>CSV to JSON Bulk</title>
        <meta name="description" content="Convert CSV to JSON Bulk - Zip Format" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Card title="CSV to JSON Bulk - Zip File" style={{marginBottom: "5px"}}/>
        <FileUploadMultiple/>
      </main>
    </>
  )
}
