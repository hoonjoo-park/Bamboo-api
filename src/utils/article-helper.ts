import { Article } from "@prisma/client";
import prisma from "../../prisma/prisma";

type ArticleList = Article & {
  author: {
    id: number;
    createdAt: Date;
    email: string;
    name: string;
    profile: {
      username: string;
      profileImage: string;
    };
  };
};

export const getArticleList = async (articles: ArticleList[]) => {
  const articleList = await Promise.all(
    articles.map(async (article) => {
      const commentCount = await prisma.comment.count({
        where: { articleId: article.id },
      });

      const likeCount = await prisma.articleLike.count({
        where: { articleId: article.id },
      });

      return {
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        cityId: article.cityId,
        districtId: article.districtId,
        commentCount: commentCount,
        likeCount: likeCount,
        createdAt: article.createdAt,
      };
    })
  );

  return articleList;
};
