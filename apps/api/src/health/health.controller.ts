import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {

  @ApiOperation({ summary: 'Verifica saúde da API' })
  @Get()
  check(){
    return { status: 'Ok' }
  }
}
