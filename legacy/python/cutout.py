import numpy as np, cv2, sys
S=sys.argv[1]
im=cv2.imread(S+'/logo.png').astype(np.float32)[:,:,::-1]
H,W=im.shape[:2]
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
cx,cy=330,320
r=np.hypot(xx-cx,yy-cy)
sel=(r>265)&(yy<585)
def feats(x,y):
    x=x/W;y=y/H
    return np.stack([np.ones_like(x),x,y,x*x,y*y,x*y,x**3,y**3,x*x*y,x*y*y],-1)
A=feats(xx[sel],yy[sel]); bg=np.zeros_like(im)
F=feats(xx,yy)
for c in range(3):
    coef,*_=np.linalg.lstsq(A,im[:,:,c][sel],rcond=None)
    bg[:,:,c]=F@coef
print('bg resid', np.abs(im[sel]-bg[sel]).mean(0))
d=np.linalg.norm(im-bg,axis=2)
a=np.clip((d-10)/70,0,1)
a[yy>560]=0
# keep largest component
m=(a>0.3).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(m)
k=1+np.argmax(st[1:,4]); keep=cv2.dilate((lab==k).astype(np.uint8),np.ones((25,25)))
a*=keep
fg=np.clip((im-(1-a[...,None])*bg)/np.maximum(a[...,None],1e-3),0,255)
out=np.dstack([fg,a*255]).astype(np.uint8)
ys,xs=np.where(a>0.02); pad=10
out=out[ys.min()-pad:ys.max()+pad, xs.min()-pad:xs.max()+pad]
cv2.imwrite(S+'/plane.png',out[:,:,[2,1,0,3]])
bgimg=np.clip(bg,0,255).astype(np.uint8)
print(out.shape, 'bg corners', bg[0,0],bg[0,-1],bg[-1,0],bg[-1,-1], bg[320,320])
# preview on checker + on shell
for name,col in [('prev_shell',(252,239,237)),('prev_dark',(20,30,60))]:
    p=out[:,:,:3].astype(float); al=out[:,:,3:]/255
    c=np.array(col,float); comp=p*al+c*(1-al)
    cv2.imwrite(S+f'/{name}.png',comp[:,:,::-1].astype(np.uint8))
