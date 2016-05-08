from bottle import Bottle, run, request
import logging
import pymysql

'''
	LOGGER
'''
# create logger with 'auth-svc'
logger = logging.getLogger('auth-svc')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
fh = logging.FileHandler('auth-svc.log')
fh.setLevel(logging.DEBUG)
# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.ERROR)
# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
# add the handlers to the logger
logger.addHandler(fh)
logger.addHandler(ch)


'''
MYSQL
'''

mysql_config = {
    'user': 'root',
    'passwd': 'intel123',
    'host': '127.0.0.1',
    'db': 'spi'
}

logger.info('Starting Bottle...')
app = Bottle()

'''
POST: /login
'''


@app.route('/login', method='POST')
def post_login():
    logger.info('Processing POST /login')
    data = request.json
    logger.info(data)
    username = data["username"]
    password = data["password"]

    try:
        cnx = pymysql.connect(**mysql_config)
        cursor = cnx.cursor()
        select_user = "SELECT count(*) FROM users WHERE username = %s and password = %s"
        data_user = (username, password)
        cursor.execute(select_user, data_user)
        results = cursor.fetchall()
        for row in results:
            if row[0] == 1:
                retdata = {
                    "status": "OK"
                }
                logger.info("Login OK")
            else:
                retdata = {
                    "status": "ERROR"
                }
                logger.info("Login ERROR")
        cursor.close()
    except pymysql.Error as err:
        msg = "Failed to select user: {}".format(err)
        logger.error(msg)
        retdata = {
            "status": "ERROR",
            "message": msg
        }
    finally:
        cnx.close()

    return retdata


'''
POST: /register
'''


@app.route('/register', method='POST')
def post_register():
    logger.info('Processing POST /register')
    data = request.json
    logger.info(data)
    username = data["username"]
    password = data["password"]

    try:
        cnx = pymysql.connect(**mysql_config)
        cursor = cnx.cursor()
        inert_user = "INSERT INTO users (username, password) VALUES (%s, %s)"
        data_user = (username, password)
        cursor.execute(inert_user, data_user)
        cnx.commit()
        cursor.close()
        retdata = {
            "status": "OK"
        }
    except pymysql.Error as err:
        msg = "Failed to register user: {}".format(err)
        logger.error(msg)
        retdata = {
            "status": "ERROR",
            "message": msg
        }
    finally:
        cnx.close()

    return retdata


'''
RUN APP
'''

run(app, host='127.0.0.1', port=8081, reloader=True)
