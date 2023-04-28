import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Modal } from './Modal/Modal';
import { useState, useEffect } from 'react';
import css from './App.module.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import { Audio } from 'react-loader-spinner';

const BASEURL = 'https://pixabay.com/api/';
const KEY = '34327121-8f2f868c5eb1d27b3154ab1d3';

export const App = () => {
  const [search, setSearchName] = useState('');
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [showModal, setModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  const onSubmitButton = values => {
    if (values.search.trim()) {
      setSearchName(values.search);
      setPage(1);
      setArticles([]);
      setTotal(0);
      setLoading(true);
    } else {
      Notiflix.Notify.failure('Please write something.');
    }
  };

  useEffect(() => {
    try {
      if (search) {
        const fetch = async () => {
          setLoading(true);
          const response = await axios.get(
            `${BASEURL}?q=${search}&page=${page}&key=${KEY}&image_type=photo&orientation=horizontal&per_page=12`
          );
          const arrey = response.data.hits.map(obj => {
            return {
              id: obj.id,
              webformatURL: obj.webformatURL,
              largeImageURL: obj.largeImageURL,
            };
          });
          const totalHits = response.data.totalHits;
          setTotal(totalHits);
          if (totalHits > 0 && page === 1) {
            Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
          }
          if (totalHits === 0) {
            setSearchName('');
            setArticles([]);
            setPage(1);
            setTotal(0);
            setLoading(false);
            Notiflix.Notify.failure(
              'Sorry, there are no images matching your search query. Please try again.'
            );
          }
          setArticles(prevState => [...prevState, ...arrey]);
          setLoading(false);
        };
        fetch();
      }
    } catch {
      Notiflix.Notify.failure('Something was wrong. Please try again.');
      setSearchName('');
      setArticles([]);
      setPage(1);
      setTotal(0);
      setLoading(false);
    }
  }, [search, page]);

  const onLoadMore = () => {
    setPage(page + 1);
    setLoading(true);
  };
  const onPics = e => {
    setCurrentImage(e.target.dataset.link);
    setModal(true);

    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') {
        setModal(false);
      }
    });
  };
  const modalHidden = e => {
    if (e.target.nodeName === 'DIV') {
      setModal(false);
    }
  };
  return (
    <div className={css.App}>
      {showModal && <Modal img={currentImage} close={modalHidden} />}
      <Searchbar onSubmit={onSubmitButton} />
      {isLoading && (
        <div className={css.Loader}>
          <Audio
            height="80"
            width="80"
            radius="9"
            color="green"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
      <ImageGallery pics={articles} onPics={onPics} />
      {articles.length !== 0 && articles.length < total && (
        <Button onLoadMore={onLoadMore} />
      )}
    </div>
  );
};
