import { getPrismicClient } from '../services/prismic';
import { FiCalendar,FiUser } from "react-icons/fi";
import { RichText } from 'prismic-dom';
import next, { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';

import Prismic from "@prismicio/client";
import Head from 'next/head';
import Link from 'next/link';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination } : HomeProps) {

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(
      postsPagination.results.map((post: Post) => {
        return { 
          ...post,
        }
      }));
      setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  function handlePagination() {
    fetch(
      `${nextPage}&access_token=${process.env.PRISMIC_ACCESS_TOKEN}}`
    ).then(res => res.json())
    .then(data => {
      const newPosts = data.results.map( post => {
        return {
          uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              { locale: ptBR }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
        setPosts([...posts, ...newPosts]);
        setNextPage(data.next_page);
    });
  }
 
  return(
   <>
   <Head>
      <title>Home | spacetraveling.</title>
   </Head>
  <main className={styles.container}>
    <section className={styles.hero}>
        <div className={styles.posts}>
          {posts.map(result => 
          <Link key={result?.uid} href="">
            <a href="/">
            <strong>{result.data?.title}</strong>
            <p>{result.data.subtitle}</p>
  
            <div className={styles.postFooter}>
              <div className={styles.createdAt}>
                <FiCalendar className={styles.icon}/>
                <span>{result.first_publication_date}</span>
              </div>
              <div className={styles.postAuthor}>
                <FiUser className={styles.icon}/>
                <span>{result.data?.author}</span>
              </div>
            </div>
          </a>
          </Link>
          )}
          </div>

            <button 
            className={styles.nextPageButton}
            type="button"
            onClick={handlePagination}
            >
              Carregar mais posts
            </button>
    
            {/* <a className={styles.nextPageButton}href="">
              Carregar mais posts
            </a> */}
    </section>
  </main>
  </>
 );
}

export const getStaticProps : GetStaticProps = async (
  {
    // preview = false, 
    previewData
  }
) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ], { 
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
    ref: previewData?.ref ?? null,
  })

  // console.log(JSON.stringify(postsResponse, null, 2));

  
  const results = postsResponse.results.map(result => {
    return { 
      uid: result.uid,
      first_publication_date: new Date(result.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data : {
        subtitle: result.data.subtitle,
        title: RichText.asText(result.data.title),
        author: result.data.author,
      }
    }
  })

  return { 
    props: {
      postsPagination: {
       next_page: postsResponse.next_page,
       results,  
      }
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }
};
