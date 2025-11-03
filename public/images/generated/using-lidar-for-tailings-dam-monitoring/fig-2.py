import numpy as np
import matplotlib.pyplot as plt
np.random.seed(0)
x = np.linspace(-3,3,200)
y = np.linspace(-3,3,200)
X,Y = np.meshgrid(x,y)
Z = -0.2*np.exp(-(X**2+(Y-1)**2)) + 0.05*np.exp(-((X+1.5)**2+(Y+1.2)**2)) + 0.01*np.random.normal(size=X.shape)
plt.figure(figsize=(6,4))
im = plt.imshow(Z, cmap='RdBu_r', origin='lower', extent=[x.min(),x.max(),y.min(),y.max()])
plt.colorbar(im,label='DoD (m)')
plt.title('Synthetic DoD heatmap — Illustrative—no site data.')

# ensure output path
import matplotlib.pyplot as plt
plt.savefig("public/images/generated/using-lidar-for-tailings-dam-monitoring/fig-2.svg")
