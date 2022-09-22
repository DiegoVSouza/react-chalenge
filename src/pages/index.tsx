import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { IoCalendarClearOutline } from "react-icons/io5";
import { BiUser } from "react-icons/bi";
import { useEffect, useState } from 'react';


import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  const formatDate = (date:string)=>{
    return format(
      new Date(date),
      "dd MMM yyyy",
      {
        locale: ptBR
      }
    )
  }


  async function getNextPage() {
    if(!nextPage) return
    const nextPagePosts = await fetch(nextPage)
    const nextPagePostResult: PostPagination = await nextPagePosts.json()

    setPosts([...posts, ...nextPagePostResult.results])
    setNextPage(nextPagePostResult.next_page)

  }

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>
      <main className={commonStyles.container}>

        <div className={styles.postsContent}>
          <img src="/logo.svg" alt="logo" />

          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.infoContainer}>
                <time><IoCalendarClearOutline />{formatDate(post.first_publication_date)}</time>
                <label><BiUser />{post.data.author}</label>
                </div>
                
              </a>
            </Link>
          ))}
          {nextPage ? <button onClick={getNextPage} >Carregar mais posts</button> : <></>}
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: {
        results: postsResponse.results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
