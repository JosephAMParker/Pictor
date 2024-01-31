import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface Item {
  img: string;
  title: string;
}

const Gallery: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [modalDimensions, setModalDimensions] = React.useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const handleOpen = (img: string) => {
    setSelectedImage(img);
    setOpen(true);
    calculateModalSize(img);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const calculateModalSize = (img: string) => {
    const tempImg = new Image();
    tempImg.src = img;

    tempImg.onload = () => {
        let width, height
        if (window.innerWidth/tempImg.width < window.innerHeight/tempImg.height){
              width = Math.min(tempImg.width, window.innerWidth * 0.9) 
              height = tempImg.height * (width / tempImg.width) 
        } else {
              height = Math.min(tempImg.height, window.innerHeight * 0.9) 
              width = tempImg.width * (height / tempImg.height)
        }
      setModalDimensions({ width, height });
    };
  };

  // Dynamically load images from the 'gallery' folder
  const importImages = (r: any) => {
    return r.keys().map((filename: string) => ({
      img: process.env.PUBLIC_URL + 'gallery/' + filename.slice(1),
      title: filename.split('/').pop()?.split('.')[0] || '', // Extracting title from filename
    }));
  };

  const itemData: Item[] = importImages(require.context('!file-loader!../../public/gallery', false, /\.(png|jpe?g|svg)$/)); 

  return (
    <>
      <ImageList sx={{ width: '100%', height: '100%' }} cols={4} rowHeight={350}>
        {itemData.map((item) => (
          <ImageListItem key={item.img} onClick={() => handleOpen(item.img)}>
            <img
              srcSet={`${item.img}?w=164&h=350&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.img}?w=164&h=350&fit=crop&auto=format`}
              alt={item.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: `${Math.min(90, modalDimensions.width / window.innerWidth * 100)}vw`,
            maxHeight: `${Math.min(90, modalDimensions.height / window.innerHeight * 100)}vh`,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <img
            src={selectedImage || ''}
            alt="Selected"
            style={{ width: '100%', height: 'auto' }}
          />
          <Button onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </>
  );
};

export default Gallery;
