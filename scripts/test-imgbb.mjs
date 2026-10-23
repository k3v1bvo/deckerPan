async function testImgBBUpload() {
  const apiKey = 'b049b0990069aec5dfec445cff31a63a';
  const imgUrl = 'https://tienda.denckerpan.com/views/logo.png';

  console.log('Probando subida a ImgBB con URL:', imgUrl);
  const formData = new FormData();
  formData.append('image', imgUrl);
  formData.append('name', 'dencker_logo');

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  console.log('Respuesta ImgBB:', data);
}

testImgBBUpload().catch(console.error);
