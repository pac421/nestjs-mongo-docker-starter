import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            exposedHeaders: 'Content-Disposition',
        },
    })

    const config = new DocumentBuilder()
        .setTitle('NestJS API')
        .setDescription('')
        .setVersion('0.0.1')
        .addTag('auth')
        .addTag('users')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    await app.listen(3000)
    console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
