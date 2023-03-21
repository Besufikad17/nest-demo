import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { Employee as EmployeeModel, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { IDate } from './utils/types';

@Controller("/api")
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post("/add")
  async addEmployee(
    @Body() employeeData: {name: string, dept: string, date_of_birth: IDate, gender: string, salary: number }
  ): Promise<EmployeeModel> {

    const { name, dept, date_of_birth, gender, salary} = employeeData;

    if(!name || !dept || !date_of_birth || !date_of_birth.day || !date_of_birth.month || !date_of_birth.year || !gender || !salary){
      throw new HttpException("Please enter all fields!!", HttpStatus.NOT_ACCEPTABLE);
    }

    const bd = new Date(date_of_birth.year, date_of_birth.month, date_of_birth.day);

    try {
      return await this.prismaService.employee.create({
        data: {
          name,
          dept,
          date_of_birth: bd,
          gender,
          salary
        }
      })
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.meta || "Error occurred check the log in the server", 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/all")
  async getAllEmployees(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<EmployeeModel[]>{
    const or = searchString ? {
      OR: [
        { name : { contains: searchString } },
        { dept: { contains: searchString } },
      ],
    }: {}

    return await this.prismaService.employee.findMany({
      where: {
        ...or
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        salary: orderBy,
      },
    })
  }
}
