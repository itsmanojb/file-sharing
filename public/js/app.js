const uploadView = document.querySelector('.upload-container');
const progressView = document.querySelector('.uploader-progress-ui');
const progressBar = document.querySelector('#progressBar');
const postUploadView = document.querySelector('.postupload-ui');
const anims = document.querySelectorAll('.will-fade-in');
const statusText = document.querySelector('.complete-text');

const dropzone = document.querySelector('.dropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('fileSelectBtn');

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.getElementById("copyURLBtn");
const fileURL = document.getElementById("fileURL");
const emailBtn = document.getElementById("emailBtn");
const emailForm = document.getElementById("emailForm");
const toast = document.querySelector(".toast");

const maxAllowedSize = 50 * 1024 * 1024; // 50MB

window.addEventListener('DOMContentLoaded', (event) => {
    anims.forEach(el => el.classList.remove('fade-in'))
});

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dropzone.classList.contains('dragged')) {
        dropzone.classList.add('dragged')
    }
})
dropzone.addEventListener('dragleave', (e) => {
    dropzone.classList.remove('dragged')
})

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragged')
    const files = e.dataTransfer.files
    if (files.length === 1) {
        if (files[0].size < maxAllowedSize) {
            fileInput.files = files
            uploadFile()
        } else {
            showToast("Max file size is 50MB");
        }
    } else if (files.length > 1) {
        showToast('Multiple file upload not supported yet.');
    }
})

browseBtn.addEventListener('click', (e) => {
    fileInput.click();
})

fileInput.addEventListener('change', () => {
    if (fileInput.files[0].size > maxAllowedSize) {
        showToast("Max file size is 50MB")
        fileInput.value = ""
        return
    }
    uploadFile()
})

const uploadFile = () => {

    uploadView.style.display = 'none';
    progressView.style.display = 'block';
    postUploadView.style.display = 'none';

    const file = fileInput.files[0]
    const formData = new FormData();
    formData.append('myFile', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (event) {
        let percent = Math.round((100 * event.loaded) / event.total);
        progressBar.style.width = `${percent}%`;
    };

    xhr.upload.onerror = function () {
        showToast(`Error in upload: ${xhr.status}.`);
        fileInput.value = "";
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            onFileUploadSuccess(xhr.responseText);
        }
    }

    xhr.open('POST', '/api/files')
    xhr.send(formData);

}

const onFileUploadSuccess = (res) => {
    fileInput.value = ""
    const {
        file: url
    } = JSON.parse(res)
    fileURL.value = url;

    uploadView.style.display = 'none';
    progressView.style.display = 'none';
    postUploadView.style.display = 'flex';
    statusText.innerText = 'Upload completed!';

    setTimeout(() => {
        anims.forEach(el => el.classList.add('fade-in'))
    }, 300);
};


copyURLBtn.addEventListener("click", () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
    fileURL.select();
});

emailBtn.addEventListener("click", () => {
    emailForm.style.display = 'flex'
});

let toastTimer;
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
};