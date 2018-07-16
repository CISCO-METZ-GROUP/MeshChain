import threading
import requests

def callPublic():
  #enable new thread with timer
  threading.Timer(15.0, callPublic).start()
  #submit get request
  r = requests.get('http://<Public-Cloud-master's-IP>:31443/productpage')
  print "Called Public Cloud API "+str(r.status_code)
def callEnterprise():
  #enable new thread with timer
  threading.Timer(15.0, callEnterprise).start()
  #submit get request 
  r = requests.get('http://<Entrprise-master's-IP>:32678/productpage')
  print "Called Enterprise "+str(r.status_code)

#starting the functions
callPublic()
callEnterprise()

