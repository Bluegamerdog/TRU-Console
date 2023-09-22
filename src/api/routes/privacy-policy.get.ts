import { Request, Response } from "express";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, request: Request, response: Response) => {
     response.render('privacy-policy');
     
}