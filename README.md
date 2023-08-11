# Запуск проекта

## 1. Переименовать файл .env-cmdrc.example в .env-cmdrc и заполнить секретными переменными

## 2 Установить пакеты

```js
npm i
```

## 3 Выполнить CLI команды

В зависимости от того, где запускается проект, локально или на сервере, выполнить команды:

- Создать таблицы в БД
- Заполнить БД данными

## Запустить проект локально

```js
npm run dev
```

## Запустить проект на сервере

```js
npm run start
```

# Скрипты

## Создать / обновить таблицы в БД

```js
npx env-cmd --environments development prisma db push
npx env-cmd --environments production prisma db push
dotenv -e .env.production npx prisma db push
```

### Заполнить БД данными для dev'a

```js
npx env-cmd --environments development prisma db seed
dotenv -e .env.development npx prisma db seed
dotenv -e .env.production npx prisma db seed
```

### Заполнить БД данными для prod'а

```js
npx env-cmd --environments production prisma db seed
```

## Сброс БД

### Сброс БД для dev'a

```js
npx env-cmd --environments development prisma migrate reset --skip-seed
```

### Сброс БД для prod'а

```js
npx env-cmd --environments production prisma migrate reset --skip-seed
```

## Открыть клиент БД

### Открыть клиент БД для dev'a

```js
npx env-cmd --environments development prisma studio
```

### Открыть клиент БД для prod'а

```js
npx env-cmd --environments production prisma studio
dotenv -e .env.production npx prisma studio
```
